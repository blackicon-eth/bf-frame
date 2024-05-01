import { NextRequest, NextResponse } from "next/server";
import { pinOnPinata, validateMessage } from "@/app/lib/utils";
import { generateFriendImage } from "@/app/lib/generateImage";
import { getInvalidFidFrame } from "@/app/lib/getFrame";
import { FrameActionDataParsedAndHubContext } from "frames.js";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user data and validating it
  const data = await req.json();

  // Validating the frame message
  const { frameMessage, isValid }: { frameMessage: FrameActionDataParsedAndHubContext | undefined; isValid: boolean } =
    await validateMessage(data);
  if (!isValid || !frameMessage) {
    return getInvalidFidFrame();
  }

  // Getting the number on mints from the nextUrl
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;
  const friendUsername = req.nextUrl.searchParams.get("friendUsername")!;
  const friendPropic = req.nextUrl.searchParams.get("friendPropic")!;
  const friendshipLevel = req.nextUrl.searchParams.get("friendshipLevel")!;

  const imageBuffer = await generateFriendImage(callerUsername, callerPropic, friendUsername, friendPropic);

  // Call pinOnPinata function to pin the image and json on Pinata
  const { imageResponse, jsonResponse } = await pinOnPinata(imageBuffer, friendUsername, callerUsername, friendshipLevel);
  console.log("Pinned image: ", imageResponse);
  console.log("Pinned json: ", jsonResponse);

  // Creating the frame
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "See transaction",
        action: "link",
        target: `https://basescan.org/tx/${frameMessage.transactionId}`,
      },
      {
        label: "Share",
        action: "link",
        target:
          "https://warpcast.com/~/compose?text=Find%20your%20farcaster%20best%20friend!%0A%0Ahttps://bf-frame.vercel.app/",
      },
      {
        label: "Tip creator",
        action: "link",
        target: "https://warpcast.com/blackicon.eth/0xe360f267",
      },
    ],
    image: {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/transaction_sent.png`,
      aspectRatio: "1:1",
    },
  });

  return new NextResponse(frame);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
