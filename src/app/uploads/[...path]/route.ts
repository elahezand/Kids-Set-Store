import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path ?? [];
  const file = path.join(UPLOAD_DIR, ...parts);

  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });

  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
