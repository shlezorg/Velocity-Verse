import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const types: Record<string,string> = {
  jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png",
  webp:"image/webp", avif:"image/avif",
};

export async function GET(_request: Request, {params}:{params:Promise<{path:string[]}>}) {
  const {path: parts} = await params;
  if (parts.length !== 3 ||
      !/^\d{4}$/.test(parts[0]) ||
      !/^(0[1-9]|1[0-2])$/.test(parts[1]) ||
      !/^[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.test(parts[2])) {
    return new Response("Not found",{status:404});
  }
  const ext = parts[2].split(".").pop()!;
  const filePath = path.join(process.cwd(),"data","uploads",...parts);
  try {
    const bytes = await fs.readFile(filePath);
    return new Response(new Uint8Array(bytes),{
      headers:{
        "Content-Type":types[ext],
        "Content-Length":String(bytes.byteLength),
        "Cache-Control":"public,max-age=31536000,immutable",
        "X-Content-Type-Options":"nosniff",
      }
    });
  } catch {
    return new Response("Not found",{status:404});
  }
}
