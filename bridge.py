from flask import Flask, request, jsonify
from flask_cors import CORS
from pypresence import Presence, ActivityType
import threading
import time
import warnings

# pypresence laisse parfois un pipe asyncio non ferme proprement sous
# Windows lors d'une reconnexion (changement de CLIENT_ID entre sources) :
# ResourceWarning inoffensif, on le masque pour ne pas polluer les logs.
warnings.filterwarnings("ignore", category=ResourceWarning)

# Discord affiche "Regarde [Nom de l'appli]" en utilisant le NOM de
# l'application liee au CLIENT_ID (pas large_text). Pour que ça affiche
# "YouTube" / "TikTok" / "Anime-Sama" correctement il faut donc 3 apps
# Discord distinctes, une par source, chacune nommee comme il faut.
#
# Va sur https://discord.com/developers/applications, cree 3 apps :
#   - nommee "Anime-Sama"
#   - nommee "YouTube"
#   - nommee "TikTok"
# et remplace les 3 ID ci-dessous par leurs Application ID respectifs.
CLIENT_IDS = {
    "animesama": "REPLACE_WITH_YOUR_ANIME_SAMA_CLIENT_ID",  # app named "Anime-Sama"
    "youtube": "REPLACE_WITH_YOUR_YOUTUBE_CLIENT_ID",        # app named "YouTube"
    "tiktok": "REPLACE_WITH_YOUR_TIKTOK_CLIENT_ID",          # app named "TikTok"
}

# Image par defaut si aucune miniature n'est trouvee / acceptee par Discord
# (a uploader dans Rich Presence > Art Assets de CHAQUE app correspondante)
DEFAULT_IMAGES = {
    "animesama": "anime_sama_logo",
    "youtube": "youtube_logo",
    "tiktok": "tiktok_logo",
}
DEFAULT_IMAGE = "anime_sama_logo"  # fallback ultime

# Mettre a True temporairement si tu as besoin de deboguer : reaffiche les
# logs detailles dans le terminal. Sinon, aucun log par mise a jour.
VERBOSE = False

app = Flask(__name__)
CORS(app)

rpc = None
rpc_source = None  # source ("animesama"/"youtube"/"tiktok") a laquelle rpc est connecte
rpc_lock = threading.Lock()

current_episode_key = None
episode_started_at = None


def log(*args):
    if VERBOSE:
        print(*args)


def connect_discord(source):
    """Connecte (ou reconnecte si la source a change) le client Discord
    correspondant, pour que le nom d'appli affiche par Discord corresponde
    a la bonne source."""

    global rpc, rpc_source

    client_id = CLIENT_IDS.get(source, CLIENT_IDS["animesama"])

    if rpc is not None and rpc_source == source:
        return True

    if rpc is not None:
        try:
            rpc.close()
        except Exception:
            pass
        rpc = None

    try:
        rpc = Presence(client_id)
        rpc.connect()
        rpc_source = source
        return True

    except Exception as e:
        log(f"Erreur connexion Discord (source={source}, client_id={client_id}) :", e)
        rpc = None
        rpc_source = None
        return False


def build_details_state(source, data):
    """Construit (details, state) selon la source (anime-sama / youtube / tiktok)."""

    title = str(data.get("title") or "")

    if source == "animesama":
        season = str(data.get("season") or "")
        episode = str(data.get("episode") or "")

        if season and episode:
            state = f"Saison {season} • Épisode {episode}"
        elif episode:
            state = f"Épisode {episode}"
        elif season:
            state = f"Saison {season}"
        else:
            state = "Sur Anime-Sama"

        return title or "Anime sur Anime-Sama", state

    if source == "youtube":
        channel = str(data.get("channel") or "")
        state = channel if channel else "Sur YouTube"
        return title or "Vidéo YouTube", state

    if source == "tiktok":
        description = str(data.get("description") or "")
        state = description[:128] if description else "Sur TikTok"
        return title or "Vidéo TikTok", state

    return title or "En cours de visionnage", "Sur le web"


def update_discord(source, data):

    global rpc, current_episode_key, episode_started_at

    with rpc_lock:

        if rpc is None or rpc_source != source:
            if not connect_discord(source):
                return

        details, state = build_details_state(source, data)

        source_label = {
            "animesama": "Anime-Sama",
            "youtube": "YouTube",
            "tiktok": "TikTok",
        }.get(source, "Anime-Sama")

        default_image = DEFAULT_IMAGES.get(source, DEFAULT_IMAGE)
        thumbnail = str(data.get("thumbnail") or "")
        large_image = thumbnail if thumbnail.startswith("http") else default_image

        current_time = data.get("currentTime")
        duration = data.get("duration")
        paused = bool(data.get("paused") or False)

        episode_key = f"{source}|{details}|{state}"

        now = time.time()

        has_progress = (
            current_time is not None
            and duration is not None
            and duration > 0
        )

        if has_progress:
            # Si la difference entre le "temps ecoule" attendu (base sur
            # l'ancien episode_started_at) et le currentTime reel envoye depasse
            # un seuil, on reset le chrono (changement d'episode / seek).
            if episode_key != current_episode_key:
                current_episode_key = episode_key
                episode_started_at = now - float(current_time)
            else:
                expected = (now - (episode_started_at or now))
                if abs(expected - float(current_time)) > 3:
                    episode_started_at = now - float(current_time)

            start_ts = int(episode_started_at)
            end_ts = int(episode_started_at + float(duration))
        else:
            if episode_key != current_episode_key:
                current_episode_key = episode_key
                episode_started_at = now
            start_ts = int(episode_started_at or now)
            end_ts = None

        payload = dict(
            activity_type=ActivityType.WATCHING,
            details=details[:128],
            state=state[:128],
            large_image=large_image,
            large_text=source_label,
        )

        if paused:
            payload["small_image"] = "pause"
            payload["small_text"] = "En pause"
        else:
            payload["start"] = start_ts
            if end_ts:
                payload["end"] = end_ts
            payload["small_image"] = "play"
            payload["small_text"] = "En cours de visionnage"

        try:
            rpc.update(**payload)
            log("MAJ :", source, "-", details, "-", state)

        except Exception as e:
            log("Erreur Rich Presence (avec image/progression) :", e)

            try:
                rpc.update(
                    activity_type=ActivityType.WATCHING,
                    details=details[:128],
                    state=state[:128],
                    large_image=default_image,
                    large_text=source_label
                )
            except Exception as e2:
                log("Erreur Rich Presence (fallback) :", e2)


@app.route(
    "/update",
    methods=["POST", "OPTIONS"]
)
def update():

    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True) or {}
    source = str(data.get("source") or "unknown")

    threading.Thread(
        target=update_discord,
        args=(source, data),
        daemon=True
    ).start()

    return jsonify({"ok": True})


@app.route(
    "/clear",
    methods=["POST"]
)
def clear():

    global rpc, rpc_source, current_episode_key, episode_started_at

    with rpc_lock:
        if rpc:
            try:
                rpc.clear()
            except Exception:
                pass

        current_episode_key = None
        episode_started_at = None

    return jsonify({"ok": True})


@app.route(
    "/ping",
    methods=["GET"]
)
def ping():
    return jsonify({"ok": True})


if __name__ == "__main__":

    connect_discord("animesama")

    print("Bridge Discord actif sur http://127.0.0.1:28491")
    print("(logs detailles desactives, passe VERBOSE=True dans bridge.py pour deboguer)")

    # Coupe les logs par-requete de Flask/Werkzeug (sinon chaque POST /update
    # affiche une ligne "127.0.0.1 - - [date] POST /update HTTP/1.1 200").
    import logging
    logging.getLogger("werkzeug").setLevel(logging.ERROR)

    app.run(
        host="127.0.0.1",
        port=28491,
        threaded=True
    )
