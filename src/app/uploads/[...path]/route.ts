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

/**
 * Serves files uploaded from the admin panel. `next start` only serves what was in public/ at build
 * time, so images uploaded later (and the Docker volume) need this route.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path ?? [];
  const file = path.join(UPLOAD_DIR, ...parts);

  // never leave the uploads folder ("../" in the URL)
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
        // uploaded names are unique, so the file never changes
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
