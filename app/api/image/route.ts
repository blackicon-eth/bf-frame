import { NextRequest, NextResponse } from "next/server";
import { generateFriendImage } from "@/app/lib/generateImage";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting params from the URL
  const callerUsername = req.nextUrl.searchParams.get("callerUsername");
  const callerPropic = req.nextUrl.searchParams.get("callerPropic");
  const friendUsername = req.nextUrl.searchParams.get("friendUsername");
  const friendPropic = req.nextUrl.searchParams.get("friendPropic");

  // Asserting that the value return with this call is a Buffer
  const image = await generateFriendImage(callerUsername, callerPropic, friendUsername, friendPropic);
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
