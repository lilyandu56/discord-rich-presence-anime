(() => {
    let lastData = "";
    let lastSentAt = 0;

    function clean(text) {
        return (text || "").replace(/\s+/g, " ").trim();
    }

    function isWatchPage() {
        return location.pathname === "/watch";
    }

    function getVideoId() {
        const params = new URLSearchParams(location.search);
        return params.get("v") || "";
    }

    function getTitle() {
        // Titre principal de la video (le h1 au-dessus du lecteur)
        const h1 = document.querySelector(
            "h1.ytd-watch-metadata, h1.title.ytd-video-primary-info-renderer, #title h1"
        );

        const fromH1 = clean(h1?.textContent);
        if (fromH1) return fromH1;

        // Fallback : titre de l'onglet, en retirant le suffixe YouTube
        return clean(document.title).replace(/\s*-\s*YouTube\s*$/i, "");
    }

    function getChannel() {
        const channelEl = document.querySelector(
            "ytd-channel-name #text, #channel-name a, ytd-video-owner-renderer ytd-channel-name a"
        );

        return clean(channelEl?.textContent);
    }

    function getThumbnail(videoId) {
        if (!videoId) return "";
        // Miniature officielle YouTube, toujours accessible publiquement,
        // donc fiable pour l'affichage Discord (pas de probleme de hotlink).
        return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    function getVideoProgress() {
        const video = document.querySelector("video.html5-main-video, video");

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
        const videoId = getVideoId();
        const title = getTitle();
        const channel = getChannel();
        const thumbnail = getThumbnail(videoId);
        const progress = getVideoProgress();

        return {
            source: "youtube",
            title: title || "Vidéo YouTube",
            channel,
            url: location.href,
            thumbnail,
            currentTime: progress?.currentTime ?? null,
            duration: progress?.duration ?? null,
            paused: progress?.paused ?? null
        };
    }

    function send(force) {

        if (!isWatchPage()) {
            chrome.runtime.sendMessage({ type: "MEDIA_CLEAR" });
            lastData = "";
            return;
        }

        const data = getData();

        const key = JSON.stringify({
            title: data.title,
            channel: data.channel,
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

    // YouTube est une SPA : la navigation entre videos ne recharge pas
    // la page, on ecoute donc ses evenements internes de navigation.
    document.addEventListener("yt-navigate-finish", () => send(true));

    document.addEventListener("play", () => send(true), true);
    document.addEventListener("pause", () => send(true), true);
    document.addEventListener("seeked", () => send(true), true);

    window.addEventListener("beforeunload", () => {
        chrome.runtime.sendMessage({ type: "MEDIA_CLEAR" });
    });
})();
