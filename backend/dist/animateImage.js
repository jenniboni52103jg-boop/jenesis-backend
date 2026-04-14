"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animateImage = animateImage;
require("dotenv/config");
const client_1 = require("@fal-ai/client");
client_1.fal.config({
    credentials: process.env.FAL_KEY,
});
function getMotionPrompt(effect) {
    switch (effect) {
        case "movie":
            return "cinematic subtle movement, slow camera push in, hair slightly moving, dramatic atmosphere, fire flickering, epic movie scene";
        case "cyberpunk":
            return "neon lights flickering, slight head movement, futuristic atmosphere, glowing reflections, cyberpunk city motion";
        case "cartoon":
            return "gentle animation, slight head tilt, blinking, soft animated movement, animated character motion";
        case "photorealistic":
            return "natural human movement, slight breathing, soft head movement, realistic subtle motion";
        default:
            return "subtle natural motion";
    }
}
async function animateImage(imageUrl, effect) {
    const motionPrompt = getMotionPrompt(effect);
    const result = await client_1.fal.subscribe("fal-ai/animate-diffusion", {
        input: {
            image_url: imageUrl,
            prompt: motionPrompt,
        },
        logs: true,
        onQueueUpdate(update) {
            if (update.status === "IN_PROGRESS") {
                for (const log of update.logs ?? []) {
                    console.log("FAL LOG:", log.message);
                }
            }
        },
    });
    const data = result?.data;
    const videoUrl = data?.video?.url ||
        data?.videos?.[0]?.url ||
        data?.data?.video?.url ||
        null;
    if (!videoUrl) {
        console.error("FAL RAW:", JSON.stringify(data, null, 2));
        throw new Error("Video non restituito da fal");
    }
    return videoUrl;
}
