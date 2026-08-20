chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "MEDIA_UPDATE" && message?.type !== "MEDIA_CLEAR") return;

    const endpoint = message.type === "MEDIA_CLEAR" ? "clear" : "update";

    fetch(`http://127.0.0.1:28491/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message.data || {})
    }).catch(() => {
        // Bridge non lance : on ignore silencieusement.
    });
});
