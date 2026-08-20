# Discord Rich Presence — Anime-Sama / YouTube / TikTok

[Français](#français) · [English](#english)

---

<a id="français"></a>
## Français

Extension Chrome + bridge Python qui affiche **en temps réel sur Discord** ce que tu regardes :

| Site          | Ce qui s'affiche sur Discord                          |
|---------------|-------------------------------------------------------|
| **Anime-Sama** | Nom de l'anime + Saison X • Épisode Y + miniature + progression |
| **YouTube**    | Titre de la vidéo + nom de la chaîne + miniature + progression |
| **TikTok**     | @utilisateur + description + miniature + progression  |

Le nom de l'application Discord change automatiquement selon le site (Anime-Sama / YouTube / TikTok).

### Prérequis

- **Windows** (recommandé, scripts de démarrage inclus) ou Linux/macOS
- **Python 3.8+** ([télécharger](https://www.python.org/downloads/) — coche bien « Add Python to PATH »)
- **Google Chrome** ou Chromium / Edge (basé sur Chromium)
- Un compte **Discord**

### 1. Créer les 3 applications Discord (obligatoire)

Discord affiche le **nom de l'application** liée au Client ID.  
Pour avoir « Regarde Anime-Sama », « Regarde YouTube » et « Regarde TikTok », il faut **3 applications distinctes**.

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique sur **New Application**
3. Crée **trois** applications avec exactement ces noms :
   - `Anime-Sama`
   - `YouTube`
   - `TikTok`
4. Pour **chaque** application :
   - Va dans l'onglet **General Information**
   - Copie l’**Application ID** (Client ID)
5. Ouvre le fichier `bridge.py` et remplace les placeholders :

```python
CLIENT_IDS = {
    "animesama": "REPLACE_WITH_YOUR_ANIME_SAMA_CLIENT_ID",  # app named "Anime-Sama"
    "youtube": "REPLACE_WITH_YOUR_YOUTUBE_CLIENT_ID",        # app named "YouTube"
    "tiktok": "REPLACE_WITH_YOUR_TIKTOK_CLIENT_ID",          # app named "TikTok"
}
```

#### Images (recommandé)

Dans chaque application → onglet **Rich Presence → Art Assets** :

| Nom du fichier asset   | Usage                              | Application concernée |
|------------------------|------------------------------------|-----------------------|
| `anime_sama_logo`      | Image par défaut Anime-Sama        | Anime-Sama            |
| `youtube_logo`         | Image par défaut YouTube           | YouTube               |
| `tiktok_logo`          | Image par défaut TikTok            | TikTok                |
| `play`                 | Petite icône lecture (optionnel)   | Les 3                 |
| `pause`                | Petite icône pause (optionnel)     | Les 3                 |

Uploade des images carrées (512×512 px recommandé).  
Si tu n’uploades rien, Discord affichera quand même le titre, mais sans image custom.

### 2. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 3. Tester le bridge manuellement

```bash
python bridge.py
```

Tu dois voir : `Bridge Discord actif sur http://127.0.0.1:28491`

### 4. Charger l’extension dans Chrome

1. Ouvre `chrome://extensions`
2. Active le **Mode développeur**
3. Clique sur **Charger l’extension non empaquetée**
4. Sélectionne **ce dossier** (celui qui contient `manifest.json`)

### 5. Utilisation

1. Lance le bridge
2. Ouvre une vidéo / un épisode sur Anime-Sama, YouTube ou TikTok
3. Discord affiche automatiquement ta présence

### 6. Démarrage automatique (Windows)

1. `Windows + R` → `shell:startup`
2. Crée un raccourci vers `start_bridge_background.pyw`

### Dépannage

| Problème | Solution |
|----------|----------|
| Rien ne s’affiche | Bridge tourne + Discord ouvert + Client IDs corrects |
| Mauvais nom d’appli | Les 3 apps doivent s’appeler exactement Anime-Sama / YouTube / TikTok |
| Logs | Mets `VERBOSE = True` dans `bridge.py` |

Le bridge écoute uniquement en local (`127.0.0.1:28491`).

---

<a id="english"></a>
## English

Chrome extension + Python bridge that displays **in real time on Discord** what you are watching:

| Site          | What appears on Discord                                      |
|---------------|--------------------------------------------------------------|
| **Anime-Sama** | Anime name + Season X • Episode Y + thumbnail + progress     |
| **YouTube**    | Video title + channel name + thumbnail + progress            |
| **TikTok**     | @username + description + thumbnail + progress               |

The Discord application name changes automatically depending on the site.

### Requirements

- **Windows** (recommended) or Linux/macOS
- **Python 3.8+** ([download](https://www.python.org/downloads/) — check “Add Python to PATH”)
- **Google Chrome** / Chromium / Edge
- A **Discord** account

### 1. Create the 3 Discord applications (required)

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create **three** applications named exactly:
   - `Anime-Sama`
   - `YouTube`
   - `TikTok`
3. Copy each **Application ID** into `bridge.py`:

```python
CLIENT_IDS = {
    "animesama": "REPLACE_WITH_YOUR_ANIME_SAMA_CLIENT_ID",
    "youtube": "REPLACE_WITH_YOUR_YOUTUBE_CLIENT_ID",
    "tiktok": "REPLACE_WITH_YOUR_TIKTOK_CLIENT_ID",
}
```

#### Images (recommended)

In each app → **Rich Presence → Art Assets**: `anime_sama_logo`, `youtube_logo`, `tiktok_logo`, optional `play` / `pause`.

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Test the bridge

```bash
python bridge.py
```

### 4. Load the extension

`chrome://extensions` → Developer mode → Load unpacked → select this folder.

### 5. Usage

Start the bridge, open a video on Anime-Sama / YouTube / TikTok → Discord shows your presence.

### 6. Auto-start (Windows)

Put a shortcut to `start_bridge_background.pyw` in `shell:startup`.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Nothing on Discord | Bridge running + Discord open + correct Client IDs |
| Wrong app name | Apps must be named exactly Anime-Sama / YouTube / TikTok |
| Logs | Set `VERBOSE = True` in `bridge.py` |

The bridge listens only locally (`127.0.0.1:28491`).

---

MIT License · Enjoy ✨
