"""
Lance bridge.py en tache de fond, sans fenetre console.
A placer en raccourci dans le dossier de demarrage Windows (shell:startup)
pour que le bridge tourne automatiquement des l'ouverture de session et
reste actif en permanence, pret a recevoir les mises a jour d'Anime-Sama,
YouTube ou TikTok des que tu ouvres une page.

Ouvre ce fichier avec "Python (windowed)" / pythonw, pas avec Python tout
court, sinon une fenetre de terminal restera affichee en permanence.
"""

import os
import sys
import subprocess
import urllib.request

BRIDGE_DIR = os.path.dirname(os.path.abspath(__file__))
BRIDGE_SCRIPT = os.path.join(BRIDGE_DIR, "bridge.py")
PING_URL = "http://127.0.0.1:28491/ping"


def already_running():
    try:
        with urllib.request.urlopen(PING_URL, timeout=1) as response:
            return response.status == 200
    except Exception:
        return False


def main():
    if already_running():
        # Le bridge tourne deja (par exemple lance a une session precedente
        # qui n'a pas ete fermee), on ne relance pas de doublon.
        return

    creationflags = 0
    if sys.platform == "win32":
        creationflags = subprocess.CREATE_NO_WINDOW

    subprocess.Popen(
        [sys.executable.replace("python.exe", "pythonw.exe"), BRIDGE_SCRIPT]
        if sys.platform == "win32" and sys.executable.lower().endswith("python.exe")
        else [sys.executable, BRIDGE_SCRIPT],
        cwd=BRIDGE_DIR,
        creationflags=creationflags,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


if __name__ == "__main__":
    main()
