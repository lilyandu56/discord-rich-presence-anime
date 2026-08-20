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
