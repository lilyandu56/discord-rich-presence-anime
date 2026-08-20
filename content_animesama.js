(() => {
    let lastData = "";
    let lastSentAt = 0;

    function clean(text) {
        return (text || "").replace(/\s+/g, " ").trim();
    }

    function getAnimeNameFromUrl() {
        const match = location.pathname.match(
            /\/catalogue\/([^/]+)\/saison/i
        );

        if (!match) {
            return "";
        }

        return decodeURIComponent(match[1])
            .replace(/-/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    function extractEpNumber(text) {
        const patterns = [
            /\b(?:épisode|episode|ep\.?)\s*[:#-]?\s*(\d{1,4})\b/i,
            /\bEP\s*(\d{1,4})\b/i
        ];

        for (const regex of patterns) {
            const match = clean(text).match(regex);
            if (match) {
                return match[1];
            }
        }

        return "";
    }

    function getEpisode() {
        const selects = Array.from(document.querySelectorAll("select"));

        for (const select of selects) {
            const selectedOption = select.options?.[select.selectedIndex];
            const optText = clean(selectedOption?.textContent || selectedOption?.value);

            const fromOption = extractEpNumber(optText);
            if (fromOption) {
                return fromOption;
            }
        }

        // Fallback: texte de la page / URL
        const bodyText = clean(document.body?.innerText || "");
        const fromBody = extractEpNumber(bodyText);
        if (fromBody) return fromBody;

        const fromUrl = location.pathname.match(/(?:episode|ep)[_-]?(\d+)/i);
        return fromUrl ? fromUrl[1] : "";
    }

    function getSeason() {
        const match = location.pathname.match(/\/saison[_-]?(\d+)/i)
            || location.pathname.match(/\/s(\d+)/i);
        return match ? match[1] : "";
    }

    function getTitle() {
        // Priorité : titre visible sur la page
        const h1 = document.querySelector("h1, .anime-title, .title");
        let title = clean(h1?.textContent);

        if (!title) {
            title = getAnimeNameFromUrl();
        }

        if (!title) {
            title = clean(document.title).replace(/\s*[-|].*$/, "");
        }

        return title || "Anime";
    }

    function absoluteUrl(src) {
        if (!src) return "";
        try {
            return new URL(src, location.href).href;
        } catch {
            return src;
        }
    }

    function getThumbnail() {
        // Cherche une image de taille raisonnable (poster / cover)
        const images = Array.from(document.querySelectorAll("img"));

        const candidate = images.find(img => {
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            return w >= 150 && h >= 150 && img.src && !img.src.includes("avatar");
        });

        if (candidate?.src) {
            return absoluteUrl(candidate.src);
        }

        // Fallback og:image
        const og = document.querySelector('meta[property="og:image"]');
        return absoluteUrl(og?.content || "");
    }

    function getVideoProgress() {
        // Cherche une <video> dans CE frame (peut etre le frame top,
        // ou une iframe de lecteur video hebergee sur un autre domaine).
        const video = document.querySelector("video");

        if (!video || isNaN(video.currentTime) || isNaN(video.duration) || !video.duration) {
            return null;
        }

        return {
            currentTime: Math.floor(video.currentTime),
            duration: Math.floor(video.duration),
            paused: video.paused
        };
    }

    function getData() {
        const title = getTitle();
        const season = getSeason();
        const episode = getEpisode();
        const thumbnail = getThumbnail();
        const progress = getVideoProgress();

        return {
            source: "animesama",
            title,
            season,
            episode,
            url: location.href,
            thumbnail,
            currentTime: progress?.currentTime ?? null,
            duration: progress?.duration ?? null,
            paused: progress?.paused ?? null
        };
    }

    function send(force) {
        // Uniquement sur les pages catalogue / lecture
        if (!/catalogue|saison|episode/i.test(location.pathname + location.href)) {
            return;
        }

        const data = getData();

        const key = JSON.stringify({
            title: data.title,
            season: data.season,
            episode: data.episode,
            thumbnail: data.thumbnail
        });

        const now = Date.now();
        const progressStale = now - lastSentAt > 15000;

        if (key === lastData && !progressStale && !force) {
            return;
        }

        lastData = key;
        lastSentAt = now;

        chrome.runtime.sendMessage({
            type: "MEDIA_UPDATE",
            data
        });
    }

    // Envoi initial + polling
    send(true);
    setInterval(send, 3000);

    // Ecoute directe des evenements video quand une balise <video> est
    // accessible dans ce frame
    document.addEventListener("play", () => send(true), true);
    document.addEventListener("pause", () => send(true), true);
    document.addEventListener("seeked", () => send(true), true);

    window.addEventListener("beforeunload", () => {
        chrome.runtime.sendMessage({ type: "MEDIA_CLEAR" });
    });
})();
