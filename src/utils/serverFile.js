import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const detectImageType = (buffer) => {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buffer.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(buffer.toString("ascii", 8, 12))) return "avif";
  return null;
};

export const saveImage = async (file, allowed = ["jpg", "png", "webp", "avif"]) => {
  if (!file || file.size === 0) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type || !allowed.includes(type)) return null;

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${type}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
};

export default saveImage;
