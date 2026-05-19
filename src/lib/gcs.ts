import { Storage } from "@google-cloud/storage";
import { config } from "../config.js";

export const storage = new Storage();
export const bucket = storage.bucket(config.gcsBucket);

export async function getSignedUrl(path: string, expiresInMinutes = 10) {
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });
  return url;
}

export async function readFileAsText(path: string) {
  const file = bucket.file(path);
  const [content] = await file.download();
  return content.toString("utf-8");
}
