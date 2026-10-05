import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// keep only safe characters so a file name can never escape the uploads folder
const safeName = (name = "file") =>
    String(name)
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^-+/, "")
        .slice(-80) || "file";

export default async function handleFileUpload(file) {
    if (!file || file.size === 0) return null;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${safeName(file.name)}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    return `/uploads/${filename}`;
}
