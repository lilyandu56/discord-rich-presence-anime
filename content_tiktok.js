(() => {
    let lastData = "";
    let lastSentAt = 0;

    function clean(text) {
        return (text || "").replace(/\s+/g, " ").trim();
    }

    function getActiveVideo() {
        // Sur le feed TikTok, plusieurs <video> peuvent exister dans le DOM
        // (pre-chargement des videos suivantes) : on prend celle qui est
        // reellement visible dans le viewport en priorite (fonctionne que
        // la video soit en lecture OU en pause), avec un fallback sur la
        // premiere video en train de jouer si aucune n'est au centre.
        const videos = Array.from(document.querySelectorAll("video"));
        if (videos.length === 0) return null;

        const visible = videos.find(v => {
            const rect = v.getBoundingClientRect();
            return rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2;
        });
        if (visible) return visible;

        const playing = videos.find(v => !v.paused && v.readyState > 2);
        if (playing) return playing;

        return videos[0];
    }

    function getContainerFor(video) {
        return video?.closest("[data-e2e='recommend-list-item-container'], [data-e2e='user-post-item'], div[class*='DivItemContainer']")
            || video?.closest("div")
            || document;
    }

    function getAuthor(container) {
        const el = container?.querySelector(
            "[data-e2e='video-author-uniqueid'], [data-e2e='browse-username'], a[href^='/@']"
        );

        const text = clean(el?.textContent);
        if (text) return text.replace(/^@/, "");

        // Fallback : extrait depuis l'URL si on est sur une page /@user/video/...
        const match = location.pathname.match(/^\/@([^/]+)/);
        return match ? match[1] : "";
    }

    function getDescription(container) {
        const el = container?.querySelector(
            "[data-e2e='video-desc'], [data-e2e='browse-video-desc']"
        );

        return clean(el?.textContent);
    }

    function getThumbnail(video) {
        // TikTok pose souvent un attribut poster sur la balise video
        if (video?.poster) return video.poster;
        return "";
    }

    function getVideoProgress(video) {
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
        const video = getActiveVideo();
        const container = getContainerFor(video);

        const author = getAuthor(container);
        const description = getDescription(container);
        const thumbnail = getThumbnail(video);
        const progress = getVideoProgress(video);

        const title = author
            ? `@${author}`
            : "Vidéo TikTok";

        return {
            source: "tiktok",
            title,
            description,
            url: location.href,
            thumbnail,
            currentTime: progress?.currentTime ?? null,
            duration: progress?.duration ?? null,
            paused: progress?.paused ?? null
        };
    }

    function send(force) {

        const video = getActiveVideo();

        if (!video) {
            chrome.runtime.sendMessage({ type: "MEDIA_CLEAR" });
            lastData = "";
            return;
        }

        const data = getData();

        const key = JSON.stringify({
            title: data.title,
            description: data.description,
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

    send(true);

    setInterval(send, 3000);

    // TikTok est une SPA a scroll infini : on observe les changements du
    // DOM plutot que de compter sur des evenements de navigation dedies.
    const observer = new MutationObserver(() => {
        send();
    });

    observer.observe(document.documentElement, {
        subtree: true,
        childList: true
    });

    document.addEventListener("play", () => send(true), true);
    document.addEventListener("pause", () => send(true), true);
    document.addEventListener("seeked", () => send(true), true);

    window.addEventListener("beforeunload", () => {
        chrome.runtime.sendMessage({ type: "MEDIA_CLEAR" });
    });
})();
