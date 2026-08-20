# Discord Rich Presence — Anime-Sama / YouTube / TikTok

Extension Chrome + bridge Python qui affiche **en temps réel sur Discord** ce que tu regardes :

| Site          | Ce qui s'affiche sur Discord                          |
|---------------|-------------------------------------------------------|
| **Anime-Sama** | Nom de l'anime + Saison X • Épisode Y + miniature + progression |
| **YouTube**    | Titre de la vidéo + nom de la chaîne + miniature + progression |
| **TikTok**     | @utilisateur + description + miniature + progression  |

Le nom de l'application Discord change automatiquement selon le site (Anime-Sama / YouTube / TikTok).

---

## Prérequis

- **Windows** (recommandé, scripts de démarrage inclus) ou Linux/macOS
- **Python 3.8+** ([télécharger](https://www.python.org/downloads/) — coche bien « Add Python to PATH »)
- **Google Chrome** ou Chromium / Edge (basé sur Chromium)
- Un compte **Discord**

---

## 1. Créer les 3 applications Discord (obligatoire)

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
    "animesama": "REPLACE_WITH_YOUR_ANIME_SAMA_CLIENT_ID",  # app nommée "Anime-Sama"
    "youtube": "REPLACE_WITH_YOUR_YOUTUBE_CLIENT_ID",        # app nommée "YouTube"
    "tiktok": "REPLACE_WITH_YOUR_TIKTOK_CLIENT_ID",          # app nommée "TikTok"
}
```

### Images (recommandé)

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

---

## 2. Installer les dépendances Python

Ouvre un terminal **dans le dossier du projet** et lance :

```bash
pip install -r requirements.txt
```

(ou manuellement : `pip install flask flask-cors pypresence`)

---

## 3. Tester le bridge manuellement

```bash
python bridge.py
```

Tu dois voir :

```
Bridge Discord actif sur http://127.0.0.1:28491
```

Laisse-le tourner. Si tu as une erreur de connexion Discord, vérifie que les Client IDs sont corrects et que Discord est bien ouvert sur ton PC.

Appuie sur `Ctrl+C` pour l’arrêter une fois le test OK.

---

## 4. Charger l’extension dans Chrome

1. Ouvre `chrome://extensions`
2. Active le **Mode développeur** (en haut à droite)
3. Clique sur **Charger l’extension non empaquetée**
4. Sélectionne **ce dossier** (celui qui contient `manifest.json`)

L’extension apparaît. Tu peux l’épingler si tu veux.

---

## 5. Utilisation

1. Lance le bridge (`python bridge.py` ou via le démarrage automatique ci-dessous)
2. Ouvre une vidéo / un épisode sur Anime-Sama, YouTube ou TikTok
3. Discord affiche automatiquement ta présence

---

## 6. Démarrage automatique en arrière-plan (Windows)

### Méthode simple (bridge toujours actif)

1. `Windows + R` → tape `shell:startup` → Entrée
2. Clic droit → Nouveau → Raccourci
3. Emplacement : chemin complet vers `start_bridge_background.pyw`  
   Exemple : `C:\Users\TonNom\Documents\animeext\start_bridge_background.pyw`
4. Nomme le raccourci « Bridge Discord Presence »

À chaque ouverture de session Windows, le bridge se lance silencieusement.

Pour le lancer tout de suite sans redémarrer : double-clique sur `start_bridge_background.pyw`  
(choisis « Python (windowed) » / `pythonw` si Windows demande).

### Méthode avancée (watcher)

Le fichier `watcher.pyw` écoute les signaux de l’extension et ne démarre le bridge que quand un onglet Anime-Sama / YouTube / TikTok est ouvert.  
Tu peux aussi le placer dans `shell:startup`.

---

## Structure des fichiers

```
animeext/
├── manifest.json
├── background.js
├── content_animesama.js
├── content_youtube.js
├── content_tiktok.js
├── bridge.py                  ← à configurer (Client IDs)
├── start_bridge_background.pyw
├── watcher.pyw
├── requirements.txt
├── README.md
└── LICENSE
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Rien ne s’affiche sur Discord | Vérifie que le bridge tourne + que Discord est ouvert + Client IDs corrects |
| Mauvais nom d’application | Vérifie que les 3 apps Discord portent bien les noms exacts |
| Pas de miniature | Uploade les assets dans le Developer Portal |
| Progression absente sur Anime-Sama | Le lecteur est parfois en iframe externe → seul un chrono « temps écoulé » apparaît |
| Erreurs de détection | Les sites changent souvent → adapter le `content_*.js` correspondant |
| Logs détaillés | Dans `bridge.py`, mets `VERBOSE = True` puis relance avec `python bridge.py` |

Le bridge écoute **uniquement en local** (`127.0.0.1:28491`). Il n’est jamais exposé sur le réseau.

---

## Notes

- Fonctionne mieux quand Discord est ouvert en application de bureau.
- Les sites peuvent changer → les scripts de contenu sont isolés par site.
- Code libre sous licence MIT.

Amuse-toi bien ✨
