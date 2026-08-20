# Discord Rich Presence — Anime-Sama / YouTube / TikTok

Cette extension affiche **en temps réel sur Discord** ce que tu regardes :

| Site          | Ce qui s'affiche sur Discord                                      |
|---------------|-------------------------------------------------------------------|
| **Anime-Sama** | Nom de l'anime + Saison X • Épisode Y + miniature + progression   |
| **YouTube**    | Titre de la vidéo + nom de la chaîne + miniature + progression    |
| **TikTok**     | @utilisateur + description + miniature + progression              |

Le nom de l'application Discord change automatiquement selon le site (Anime-Sama, YouTube ou TikTok).

---

## Ce dont tu as besoin

Avant de commencer, tu dois avoir :

1. **Python** (obligatoire)
2. **Google Chrome** (ou Edge / Brave — n'importe quel navigateur basé sur Chromium)
3. **Discord** installé sur ton PC (l'application de bureau, pas seulement le site web)
4. Un compte Discord

---

## Étape 0 — Installer Python

Si tu n'as **pas encore Python** sur ton ordinateur :

1. Va sur le site officiel : [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Clique sur le gros bouton jaune **Download Python**
3. Lance le fichier téléchargé
4. **TRÈS IMPORTANT** : en bas de la première fenêtre d'installation, coche la case  
   **「 Add python.exe to PATH 」**  
   (sans ça, les commandes ne marcheront pas)
5. Clique sur **Install Now** et attends la fin
6. Une fois terminé, ferme la fenêtre

Pour vérifier que Python est bien installé :
- Appuie sur `Windows + R`
- Tape `cmd` puis Entrée
- Dans la fenêtre noire, tape :
  ```
  python --version
  ```
- Tu dois voir quelque chose comme `Python 3.12.x` (le numéro peut varier)

Si tu as une erreur du type « python n'est pas reconnu », c'est que la case PATH n'a pas été cochée : réinstalle Python en cochant bien la case.

---

## Étape 1 — Télécharger ce projet

1. Sur cette page GitHub, clique sur le bouton vert **Code**
2. Clique sur **Download ZIP**
3. Décompresse le fichier ZIP quelque part (par exemple dans `Documents\animeext`)

Tu dois avoir un dossier qui contient notamment :
- `bridge.py`
- `manifest.json`
- `start_bridge_background.pyw`
- etc.

---

## Étape 2 — Créer les 3 applications Discord (obligatoire)

Discord affiche le **nom de l'application**.  
Pour avoir « Regarde **Anime-Sama** », « Regarde **YouTube** » et « Regarde **TikTok** », il faut **3 applications différentes**.

1. Va sur : [https://discord.com/developers/applications](https://discord.com/developers/applications)  
   (connecte-toi avec ton compte Discord si besoin)
2. Clique sur **New Application** (en haut à droite)
3. Crée **trois** applications, une par une, avec **exactement** ces noms :
   - `Anime-Sama`
   - `YouTube`
   - `TikTok`
4. Pour **chaque** application :
   - Clique sur l'application
   - Dans l'onglet **General Information** (à gauche)
   - Copie l'**Application ID** (c'est une longue série de chiffres)
5. Ouvre le fichier `bridge.py` avec un éditeur de texte (Bloc-notes, Notepad++, VS Code…)
6. Cherche ces lignes vers le début du fichier :

```python
CLIENT_IDS = {
    "animesama": "REPLACE_WITH_YOUR_ANIME_SAMA_CLIENT_ID",
    "youtube": "REPLACE_WITH_YOUR_YOUTUBE_CLIENT_ID",
    "tiktok": "REPLACE_WITH_YOUR_TIKTOK_CLIENT_ID",
}
```

7. Remplace chaque `REPLACE_WITH_YOUR_...` par l'Application ID correspondant (garde les guillemets) :

```python
CLIENT_IDS = {
    "animesama": "1234567890123456789",   # l'ID de ton app "Anime-Sama"
    "youtube": "1234567890123456789",     # l'ID de ton app "YouTube"
    "tiktok": "1234567890123456789",      # l'ID de ton app "TikTok"
}
```

8. Sauvegarde le fichier (`Ctrl + S`)

### Images (recommandé, mais optionnel)

Pour avoir de belles images sur Discord :

1. Dans chaque application Discord → onglet **Rich Presence** → **Art Assets**
2. Clique sur **Add Image(s)** et uploade des images carrées (idéalement 512×512 pixels)
3. Nomme-les **exactement** comme ça :

| Nom exact de l'image   | Pour quelle app |
|------------------------|-----------------|
| `anime_sama_logo`      | Anime-Sama      |
| `youtube_logo`         | YouTube         |
| `tiktok_logo`          | TikTok          |
| `play` (optionnel)     | Les 3           |
| `pause` (optionnel)    | Les 3           |

Si tu ne mets aucune image, Discord affichera quand même le titre, juste sans miniature custom.

---

## Étape 3 — Installer les bibliothèques Python

1. Ouvre le dossier du projet (celui qui contient `bridge.py`)
2. Dans la barre d'adresse de l'Explorateur Windows, tape `cmd` puis Entrée  
   → une fenêtre noire s'ouvre **déjà dans le bon dossier**
3. Tape cette commande puis Entrée :

```
pip install -r requirements.txt
```

Tu dois voir des lignes qui se déroulent, puis quelque chose comme `Successfully installed...`

Si `pip` n'est pas reconnu, essaie :

```
python -m pip install -r requirements.txt
```

---

## Étape 4 — Tester le bridge une première fois

Toujours dans la même fenêtre de commande (ou une nouvelle ouverte dans le dossier) :

```
python bridge.py
```

Tu dois voir apparaître :

```
Bridge Discord actif sur http://127.0.0.1:28491
```

- Si tu vois ça → c'est bon, laisse la fenêtre ouverte pour le moment
- Si tu as une erreur de connexion Discord → vérifie que les 3 IDs dans `bridge.py` sont corrects et que Discord est **ouvert** sur ton PC

Pour arrêter le test : appuie sur `Ctrl + C` dans la fenêtre.

---

## Étape 5 — Charger l'extension dans Chrome

1. Ouvre Chrome
2. Dans la barre d'adresse, tape : `chrome://extensions` puis Entrée
3. En haut à droite, active le **Mode développeur** (le bouton doit être bleu)
4. Clique sur **Charger l'extension non empaquetée**
5. Sélectionne le **dossier** du projet (celui qui contient `manifest.json`)  
   → pas un fichier, le dossier entier
6. L'extension apparaît dans la liste. Tu peux l'épingler si tu veux (icône puzzle en haut à droite de Chrome)

---

## Étape 6 — Utilisation au quotidien

### Lancer le bridge

**Méthode simple (recommandée pour commencer) :**

1. Va dans le dossier du projet
2. Fais un **clic droit** sur `start_bridge_background.pyw`
3. Choisis **Ouvrir avec** → **Python**  
   ⚠️ **Important** : choisis bien **Python**, **pas** « Python (windowed) » / `pythonw`.  
   D'après les tests, ça ne fonctionne correctement qu'avec **Python** classique.
4. Une petite fenêtre de terminal peut s'ouvrir un instant, c'est normal.  
   Le bridge tourne maintenant en arrière-plan.

Tu peux aussi double-cliquer sur `start_bridge_background.pyw` si Windows propose déjà Python par défaut.

### Regarder quelque chose

1. Assure-toi que **Discord** est ouvert
2. Ouvre une vidéo / un épisode sur :
   - Anime-Sama
   - YouTube
   - ou TikTok
3. Au bout de quelques secondes, Discord affiche ta présence (« Regarde … »)

### Arrêter le bridge

- Ferme la fenêtre de terminal si elle est visible, **ou**
- Ouvre le Gestionnaire des tâches (`Ctrl + Maj + Échap`) → cherche `python` → Fin de tâche

---

## Démarrage automatique à chaque ouverture de Windows (optionnel)

Pour ne plus avoir à lancer le bridge à la main :

1. Appuie sur `Windows + R`
2. Tape `shell:startup` puis Entrée  
   → le dossier de démarrage Windows s'ouvre
3. Fais un **clic droit** dans ce dossier → **Nouveau** → **Raccourci**
4. Clique sur **Parcourir** et sélectionne le fichier  
   `start_bridge_background.pyw` (chemin complet)
5. Clique sur Suivant, nomme le raccourci par exemple `Bridge Discord`, puis Terminer
6. **Clic droit** sur le raccourci créé → **Propriétés**
7. Dans « Cible », si ce n'est pas déjà le cas, tu peux forcer Python.  
   Le plus simple reste de laisser le raccourci pointer vers le `.pyw` et de t'assurer que les `.pyw` s'ouvrent avec **Python** (voir ci-dessous).

### Associer les fichiers .pyw à Python (si besoin)

1. Clic droit sur `start_bridge_background.pyw` → **Ouvrir avec** → **Choisir une autre application**
2. Sélectionne **Python** (pas Python windowed)
3. Coche « Toujours utiliser cette application pour ouvrir les fichiers .pyw »
4. Valide

À partir de maintenant, à chaque démarrage de Windows, le bridge se lancera tout seul.

---

## Dépannage

| Problème | Que faire |
|----------|-----------|
| `python` n'est pas reconnu | Réinstalle Python en cochant **Add python.exe to PATH** |
| Rien ne s'affiche sur Discord | 1) Le bridge tourne-t-il ? 2) Discord est-il ouvert ? 3) Les 3 IDs dans `bridge.py` sont-ils corrects ? |
| Mauvais nom d'application (ex. « Application ») | Les 3 apps Discord doivent s'appeler **exactement** `Anime-Sama`, `YouTube` et `TikTok` |
| Le `.pyw` ne fait rien | Ouvre-le avec **Python** (pas « Python windowed ») — clic droit → Ouvrir avec → Python |
| Pas de miniature | Uploade les images dans le Developer Portal (voir Étape 2) |
| Progression absente sur Anime-Sama | Le lecteur est parfois dans une iframe externe → seul un chrono « temps écoulé » s'affiche, c'est normal |
| Erreurs de détection de titre / épisode | Les sites changent souvent leur page → il faudra adapter le fichier `content_*.js` correspondant |
| Voir les logs pour déboguer | Ouvre `bridge.py`, change `VERBOSE = False` en `VERBOSE = True`, puis lance `python bridge.py` dans un terminal |

Le bridge écoute **uniquement en local** (`127.0.0.1:28491`). Il n'est jamais accessible depuis Internet.

---

## Structure des fichiers

```
animeext/
├── manifest.json                 ← config de l'extension Chrome
├── background.js                 ← service worker de l'extension
├── content_animesama.js          ← détection sur Anime-Sama
├── content_youtube.js            ← détection sur YouTube
├── content_tiktok.js             ← détection sur TikTok
├── bridge.py                     ← cœur du système (à configurer avec tes IDs)
├── start_bridge_background.pyw   ← lance le bridge facilement
├── watcher.pyw                   ← version avancée (démarrage/arrêt auto)
├── requirements.txt              ← liste des bibliothèques Python
├── README.md                     ← ce fichier
└── LICENSE
```

---

## Notes

- Fonctionne mieux avec **Discord en application de bureau** (pas uniquement dans le navigateur).
- Les sites (Anime-Sama, YouTube, TikTok) peuvent changer leur structure HTML → les scripts peuvent parfois nécessiter une mise à jour.
- Code libre sous licence MIT : tu peux modifier et redistribuer.

Amuse-toi bien ✨
