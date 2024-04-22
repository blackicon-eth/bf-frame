import { NextRequest, NextResponse } from "next/server";
import { pinOnPinata, validateMessage } from "@/app/lib/utils";
import { generateFriendImage } from "@/app/lib/generateImage";
import { getInvalidFidFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the frame request
  const body = await req.json();

  // Getting the number on mints from the nextUrl
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;
  const friendUsername = req.nextUrl.searchParams.get("friendUsername")!;
  const friendPropic = req.nextUrl.searchParams.get("friendPropic")!;
  const friendshipLevel = req.nextUrl.searchParams.get("friendshipLevel")!;

  const imageBuffer = await generateFriendImage(callerUsername, callerPropic, friendUsername, friendPropic);
  const { imageResponse, jsonResponse } = await pinOnPinata(imageBuffer, friendUsername, callerUsername, friendshipLevel);

  console.log("Pinned image: ", imageResponse);
  console.log("Pinned json: ", jsonResponse);

  // Validating the frame message
  const { isValid } = await validateMessage(body);
  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  return getInvalidFidFrame();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
