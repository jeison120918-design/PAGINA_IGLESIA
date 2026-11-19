#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
actualizar-seguidores.py — Observador automático de seguidores de JEMAF.

Visita las páginas públicas de las redes de la Iglesia Jesucristo es Mi
Amigo Fiel (JEMAF) por fuera, observa cuántos seguidores tiene cada una y
actualiza assets/social-stats.json, la fuente de verdad que lee la página
(js/main.js). Solo se sube el cambio a GitHub cuando hay cifras nuevas
reales. Nunca se inventan cifras: si una página bloquea la visita o no
trae el contador, se registra como bloqueada/no observable y se conserva
el último valor conocido.

Uso:
    python3 actualizar-seguidores.py [--repo DIR] [--no-push]

  --repo DIR   Directorio local del repositorio (por defecto, el de este
               script: ~/workspace/pagina-iglesia/repo-v13).
  --no-push    Solo actualiza el JSON local y el registro; no sube a GitHub.

Fuentes:
  - YouTube (Javier y Marnie): API pública de SocialCounts (sin clave).
  - TikTok @profetajavierbelliard: página pública, datos del autor.
  - X @Prophetjavier: página pública, datos incrustados del perfil.
  - Instagram, Facebook y Threads: se intentan, pero hoy sus páginas
    públicas no entregan el contador a una visita automática (Instagram y
    Threads no lo traen en el HTML; Facebook devuelve HTTP 400). Quedan
    como referencia hasta que se conecten sus APIs oficiales.
"""

import base64
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

try:
    from zoneinfo import ZoneInfo
except Exception:  # pragma: no cover
    ZoneInfo = None

REPO_DEFAULT = os.path.join(os.path.expanduser("~"), "workspace",
                            "pagina-iglesia", "repo-v13")
JSON_REL = os.path.join("assets", "social-stats.json")
LOG_NAME = "ultima-ejecucion.log"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
TIMEOUT = 20
OWNER = "jeison120918-design"
REPO = "PAGINA_IGLESIA"
GITHUB_CLI = "/opt/hatch/bin/github"

# Canales y perfiles que se observan.
TARGETS = [
    {"key": "pastorJavier.youtube", "kind": "youtube",
     "channel_id": "UCrrGRL_XdPleFjWNAa0-Dhg",
     "label": "YouTube @Profetajavierbelliard"},
    {"key": "pastoraMarnie.youtube", "kind": "youtube",
     "channel_id": "UCv4mZWLz5ZBHLEkT3ycC9fA",
     "label": "YouTube @profetaMarnieBelliard"},
    {"key": "pastorJavier.tiktok", "kind": "tiktok",
     "username": "profetajavierbelliard",
     "label": "TikTok @profetajavierbelliard"},
    {"key": "pastorJavier.x", "kind": "x",
     "username": "Prophetjavier",
     "label": "X @Prophetjavier"},
    {"key": "pastorJavier.instagram", "kind": "instagram",
     "username": "profetajavierbelliard",
     "label": "Instagram @profetajavierbelliard"},
    {"key": "pastoraMarnie.instagram", "kind": "instagram",
     "username": "marnie_disla_belliard",
     "label": "Instagram @marnie_disla_belliard"},
    {"key": "pastorJavier.facebook", "kind": "facebook",
     "username": "profetajavieroficial",
     "label": "Facebook profetajavieroficial"},
    {"key": "iglesia.facebook", "kind": "facebook",
     "username": "jesucristoesmiamigofiel1",
     "label": "Facebook jesucristoesmiamigofiel1"},
    {"key": "pastorJavier.threads", "kind": "threads",
     "username": "profetajavierbelliard",
     "label": "Threads @profetajavierbelliard"},
]

SOCIALCOUNTS = ("https://api.socialcounts.org/"
                "youtube-live-subscriber-count/{}")


def log(msg):
    print(msg, flush=True)


def fetch_text(url):
    """Devuelve (http_status, texto) de una página pública."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return resp.status, resp.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:  # timeout, DNS, etc.
        return 0, str(e)


def fetch_json(url):
    status, text = fetch_text(url)
    if status != 200 or not text:
        return None, status
    try:
        return json.loads(text), status
    except Exception:
        return None, status


def observe_youtube(t):
    data, status = fetch_json(SOCIALCOUNTS.format(t["channel_id"]))
    if not data or "counters" not in data:
        return None, "bloqueado", \
            "SocialCounts HTTP {} o sin datos".format(status)
    counters = data["counters"]
    est = counters.get("estimation") or {}
    api = counters.get("api") or {}
    subs = est.get("subscriberCount") or api.get("subscriberCount")
    videos = est.get("videoCount") or api.get("videoCount")
    if not isinstance(subs, int):
        return None, "bloqueado", "SocialCounts sin subscriberCount"
    extra = {"ytVideos": videos} if isinstance(videos, int) else {}
    return subs, "observado", \
        "SocialCounts: {} suscriptores, {} videos".format(subs, videos), extra


def observe_tiktok(t):
    url = "https://www.tiktok.com/@{}".format(t["username"])
    status, html = fetch_text(url)
    if status != 200 or not html:
        return None, "bloqueado", "TikTok HTTP {}".format(status)
    idx = html.find('"uniqueId":"{}"'.format(t["username"]))
    if idx < 0:
        return None, "no_observable", \
            "TikTok: no se encontró el perfil en la página"
    seg = html[idx:idx + 4000]
    m = re.search(r'"followerCount":\s*"?(\d+)"?', seg)
    if not m:
        return None, "no_observable", \
            "TikTok: sin followerCount en los datos del autor"
    return int(m.group(1)), "observado", \
        "Página pública: followerCount {} en los datos del autor".format(
            m.group(1))


def observe_x(t):
    url = "https://x.com/{}".format(t["username"])
    status, html = fetch_text(url)
    if status != 200 or not html:
        return None, "bloqueado", "X HTTP {}".format(status)
    m = re.search(r'"relationship_counts":\s*\{\s*"followers":\s*(\d+)',
                  html.replace('\\"', '"'))
    if not m:
        return None, "no_observable", \
            "X: sin relationship_counts en la página"
    return int(m.group(1)), "observado", \
        "Página pública: relationship_counts.followers {}".format(m.group(1))


def observe_instagram(t):
    url = "https://www.instagram.com/{}/".format(t["username"])
    status, html = fetch_text(url)
    if status != 200 or not html:
        return None, "bloqueado", "Instagram HTTP {}".format(status)
    if re.search(r'edge_followed_by.{0,80}"count":\s*(\d+)', html):
        n = int(re.search(
            r'edge_followed_by.{0,80}"count":\s*(\d+)', html).group(1))
        return n, "observado", "Página pública: edge_followed_by {}".format(n)
    return None, "no_observable", \
        ("La página pública carga (HTTP 200) pero su HTML no trae el "
         "contador de seguidores; Instagram lo sirve solo con "
         "JavaScript/inicio de sesión.")


def observe_facebook(t):
    url = "https://www.facebook.com/{}/".format(t["username"])
    status, html = fetch_text(url)
    if status != 200:
        return None, "bloqueado", \
            "Facebook HTTP {} (página de error anti-bots)".format(status)
    return None, "no_observable", \
        "Facebook carga pero sin contador legible en el HTML"


def observe_threads(t):
    url = "https://www.threads.net/@{}".format(t["username"])
    status, html = fetch_text(url)
    if status != 200 or not html:
        return None, "bloqueado", "Threads HTTP {}".format(status)
    m = re.search(r'"follower_count":\s*(\d+)', html)
    if m:
        return int(m.group(1)), "observado", \
            "Página pública: follower_count {}".format(m.group(1))
    return None, "no_observable", \
        "La página pública carga (HTTP 200) pero su HTML no trae el contador"


OBSERVERS = {
    "youtube": observe_youtube,
    "tiktok": observe_tiktok,
    "x": observe_x,
    "instagram": observe_instagram,
    "facebook": observe_facebook,
    "threads": observe_threads,
}


def get_nested(d, key):
    cur = d
    for part in key.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def set_nested(d, key, value):
    cur = d
    parts = key.split(".")
    for part in parts[:-1]:
        cur = cur.setdefault(part, {})
    cur[parts[-1]] = value


def now_iso():
    if ZoneInfo:
        now = datetime.now(ZoneInfo("America/Santo_Domingo"))
    else:
        now = datetime.now(timezone.utc)
    return now


def github_read_file(path):
    """Lee un archivo de GitHub (rama main) vía la CLI del conector."""
    args = {"owner": OWNER, "repo": REPO, "path": path}
    r = subprocess.run([GITHUB_CLI, "call-read-tool", "--name",
                        "get_file_contents", "--arguments-json",
                        json.dumps(args)], capture_output=True, text=True,
                       timeout=60)
    if r.returncode != 0:
        return None, None
    try:
        payload = json.loads(r.stdout)
        text = payload["result"]["content"][0]["text"]
        data = json.loads(text)
        if isinstance(data, dict) and "content" in data:
            raw = base64.b64decode(data["content"]).decode("utf-8")
            return raw, data.get("sha")
        return text, None
    except Exception:
        return None, None


def github_write_file(path, content, message, sha):
    """Crea o actualiza un archivo en GitHub (rama main)."""
    args = {"owner": OWNER, "repo": REPO, "path": path,
            "content": base64.b64encode(content.encode("utf-8")).decode(),
            "message": message, "branch": "main"}
    if sha:
        args["sha"] = sha
    r = subprocess.run([GITHUB_CLI, "call-tool", "--name",
                        "create_or_update_file", "--arguments-json",
                        json.dumps(args)], capture_output=True, text=True,
                       timeout=180)
    return r.returncode == 0, (r.stdout + r.stderr)[-1500:]


def main():
    repo = REPO_DEFAULT
    push = True
    argv = sys.argv[1:]
    i = 0
    while i < len(argv):
        if argv[i] == "--repo" and i + 1 < len(argv):
            repo = argv[i + 1]
            i += 2
        elif argv[i] == "--no-push":
            push = False
            i += 1
        else:
            i += 1

    json_path = os.path.join(repo, JSON_REL)
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           LOG_NAME)

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    now = now_iso()
    stamp = now.strftime("%d %b %Y, %H:%M AST")
    iso = now.isoformat(timespec="seconds")

    changes = []
    observations = []
    for t in TARGETS:
        fn = OBSERVERS[t["kind"]]
        result = fn(t)
        value, status, detail = result[0], result[1], result[2]
        extra = result[3] if len(result) > 3 else {}
        entry = get_nested(data["stats"], t["key"]) or {}
        old = entry.get("count")
        observations.append({
            "network": t["label"], "status": status, "detail": detail})
        if status == "observado" and isinstance(value, int):
            if old != value:
                changes.append("{}: {} -> {}".format(t["label"], old, value))
                entry["count"] = value
                entry["status"] = "observado"
                if "source" not in entry:
                    entry["source"] = None
                set_nested(data["stats"], t["key"], entry)
            else:
                entry["status"] = "observado"
                set_nested(data["stats"], t["key"], entry)
            # Datos extra (p. ej. total de videos de YouTube).
            for ek, ev in extra.items():
                group = t["key"].rsplit(".", 1)[0]
                e2 = get_nested(data["stats"], group + "." + ek) or {}
                if e2.get("count") != ev:
                    changes.append("{}.{}: {} -> {}".format(
                        group, ek, e2.get("count"), ev))
                    e2["count"] = ev
                    e2["status"] = "observado"
                    set_nested(data["stats"], group + "." + ek, e2)
        elif status in ("bloqueado", "no_observable"):
            # Se conserva el último valor conocido; solo se registra.
            if entry.get("status") in ("observado", "referencia"):
                pass
        log("[{}] {} -> {} ({})".format(
            status, t["label"], value if value is not None else "-", detail))

    data["observations"] = observations
    data["updated_at"] = iso
    data["updated_at_local"] = stamp
    data["updated_by"] = ("actualizar-seguidores.py (observación externa "
                          "automática)")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    report = ["Ejecución: {}".format(stamp),
              "Cambios: {}".format(
                  "; ".join(changes) if changes else "ninguno"),
              ""]
    for o in observations:
        report.append("- [{}] {}: {}".format(
            o["status"], o["network"], o["detail"]))
    with open(log_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report) + "\n")

    log("Cambios: {}".format(
        "; ".join(changes) if changes else "ninguno"))

    if not push:
        log("Modo --no-push: JSON local actualizado, sin subir a GitHub.")
        return 0

    if not changes:
        log("Sin cambios reales: no se sube nada a GitHub.")
        return 0

    with open(json_path, encoding="utf-8") as f:
        content = f.read()
    _, sha = github_read_file(JSON_REL)
    msg = ("Actualiza contadores de seguidores por observación externa "
           "({}): {}".format(stamp, "; ".join(changes)))
    ok, out = github_write_file(JSON_REL, content, msg, sha)
    if ok:
        log("Subido a GitHub (main): {}".format(JSON_REL))
        return 0
    log("ERROR al subir a GitHub: {}".format(out))
    return 1


if __name__ == "__main__":
    sys.exit(main())
