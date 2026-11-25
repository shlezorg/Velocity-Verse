import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per photo
const supported = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"],
  ["image/webp", "webp"], ["image/avif", "avif"],
]);

function isRealImage(data: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg") return data[0] === 255 && data[1] === 216 && data[2] === 255;
  if (mime === "image/png") return data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71;
  if (mime === "image/webp") return String.fromCharCode(...data.slice(0,4)) === "RIFF"
    && String.fromCharCode(...data.slice(8,12)) === "WEBP";
  if (mime === "image/avif") return String.fromCharCode(...data.slice(4,12)).includes("ftypavif")
    || String.fromCharCode(...data.slice(4,16)).includes("ftypavis");
  return false;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
    return NextResponse.json({error: "Sign in to Velocity Verse Studio to upload photos."},{status:401});
  }

  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((part): part is File => part instanceof File);
    if (files.length < 1 || files.length > MAX_FILES) {
      return NextResponse.json({error:"Select between 1 and 10 photos."},{status:400});
    }

    // Validate the complete batch before writing anything.
    const checked: { data: Uint8Array; ext: string; name: string }[] = [];
    for (const file of files) {
      const ext = supported.get(file.type);
      if (!ext || file.size === 0 || file.size > MAX_BYTES) {
        return NextResponse.json({error:`${file.name}: Use JPG, PNG, WebP or AVIF (max 10 MB each).`},{status:400});
      }
      const data = new Uint8Array(await file.arrayBuffer());
      if (!isRealImage(data, file.type)) {
        return NextResponse.json({error:`${file.name} is not a valid supported image.`},{status:400});
      }
      checked.push({ data, ext, name:file.name });
    }

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth()+1).padStart(2,"0");
    // Store outside public so newly uploaded images work in dev and production on persistent servers.
    const directory = path.join(process.cwd(),"data","uploads",year,month);
    await fs.mkdir(directory,{recursive:true});
    const images = [];
    for (const file of checked) {
      const filename = `${randomUUID()}.${file.ext}`;
      await fs.writeFile(path.join(directory,filename), file.data, {flag:"wx"});
      images.push({
        src:`/api/media/${year}/${month}/${filename}`,
        alt:file.name.replace(/\.[a-z0-9]+$/i,"").replace(/[_-]+/g," ").trim(),
        caption:"",
      });
    }
    return NextResponse.json({images},{status:201});
  } catch (error) {
    console.error("Velocity Verse media upload failed:",error);
    return NextResponse.json({error:"Image upload failed; check your server storage."},{status:500});
  }
}
