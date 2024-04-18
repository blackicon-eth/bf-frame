import { NextRequest, NextResponse } from "next/server";
import { generateFriendImage } from "@/app/lib/generateImage";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting params from the URL
  const callerUsername = req.nextUrl.searchParams.get("callerUsername");
  const callerPropic = req.nextUrl.searchParams.get("callerPropic");
  const friendUsername = req.nextUrl.searchParams.get("friendUsername");
  const friendPropic = req.nextUrl.searchParams.get("friendPropic");

  // Convert null or empty string to undefined
  const _callerUsername = callerUsername || undefined;
  const _callerPropic = callerPropic || undefined;
  const _friendUsername = friendUsername || undefined;
  const _friendPropic = friendPropic || undefined;

  const image = await generateFriendImage(_callerUsername, _callerPropic, _friendUsername, _friendPropic);
  return new NextResponse(image);
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
