import { NextRequest, NextResponse } from "next/server";
import { generateFriendImage } from "@/app/lib/generateImage";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting params from the URL
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;

  const image = await generateFriendImage(callerUsername, callerPropic);
  return new NextResponse(image);
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
