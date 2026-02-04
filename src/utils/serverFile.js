import { writeFile } from "fs/promises";
import path from "path";
export default async function handleFileUpload(file) {
    if (!file || file.size === 0) return null;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + file.name;
    const filePath = path.join(process.cwd(), "public/uploads/" + filename);
    await writeFile(filePath, buffer);
    return `/uploads/${filename}`; // relative URL
}

