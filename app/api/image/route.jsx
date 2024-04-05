import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import satori from "satori";
import sharp from "sharp";

async function getResponse(req) {
  // Getting params
  const fid = req.nextUrl.searchParams.get("fid");

  const imagePath = path.join(process.cwd(), "public/frames/front_image.jpg");
  const buffer = fs.readFileSync(imagePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const svg = await satori(
    <body>
      <img src={arrayBuffer} />
      <span>{fid}</span>
    </body>,
    {
      width: 1910,
      height: 1000,
      fonts: [],
    }
  );
  return new NextResponse(await sharp(Buffer.from(svg)).toFormat("png").toBuffer());
}

export async function GET(req) {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
