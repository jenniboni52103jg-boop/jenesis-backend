import axios from "axios";

export async function faceSwap(sourceUrl: string, targetUrl: string) {
  const res = await axios.post(
    "https://api.deepai.org/api/face-swap",
    {
      image1: sourceUrl,
      image2: targetUrl,
    },
    {
      headers: {
        "api-key": process.env.DEEPAI_KEY!,
      },
    }
  );

  return res.data.output_url;
}