"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoFromText = createVideoFromText;
async function createVideoFromText(prompt) {
    const response = await fetch("https://injurable-giavanna-purselike.ngrok-free.dev/text-to-video", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        throw new Error("Errore backend");
    }
    const data = await response.json();
    return {
        videoUrl: data.videoUrl, // 👈 URL VERO DEL VIDEO
    };
}
