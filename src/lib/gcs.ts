import { Storage } from "@google-cloud/storage";
import { config } from "../config.js";

export const storage = new Storage();
export const bucket = storage.bucket(config.gcsBucket);

export async function getSignedUrl(path: string, expiresInMinutes = 10): Promise<string> {
  try {
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  } catch (err) {
    console.error(`[GCS] getSignedUrl 失败 path=${path}:`, err);
    throw new Error("GCS 签名 URL 生成失败");
  }
}

export async function readFileAsText(path: string): Promise<string> {
  try {
    const file = bucket.file(path);
    const [content] = await file.download();
    return content.toString("utf-8");
  } catch (err) {
    console.error(`[GCS] readFileAsText 失败 path=${path}:`, err);
    throw new Error("GCS 文件读取失败");
  }
}
