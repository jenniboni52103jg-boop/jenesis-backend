"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faceSwap = faceSwap;
const axios_1 = __importDefault(require("axios"));
async function faceSwap(sourceUrl, targetUrl) {
    const res = await axios_1.default.post("https://api.deepai.org/api/face-swap", {
        image1: sourceUrl,
        image2: targetUrl,
    }, {
        headers: {
            "api-key": process.env.DEEPAI_KEY,
        },
    });
    return res.data.output_url;
}
