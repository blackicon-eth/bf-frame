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

  console.log("Frame message: ", frameMessage);

  // Getting the number on mints from the nextUrl
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;
  const friendUsername = req.nextUrl.searchParams.get("friendUsername")!;
  const friendPropic = req.nextUrl.searchParams.get("friendPropic")!;
  const friendshipLevel = req.nextUrl.searchParams.get("friendshipLevel")!;

  const imageBuffer = await generateFriendImage(callerUsername, callerPropic, friendUsername, friendPropic);

  // Call pinOnPinata without waiting for it to end
  pinOnPinata(imageBuffer, friendUsername, callerUsername, friendshipLevel)
    .then(({ imageResponse, jsonResponse }) => {
      console.log("Pinned image: ", imageResponse);
      console.log("Pinned json: ", jsonResponse);
    })
    .catch((error) => {
      console.error("Error pinning on Pinata: ", error);
    });

  // Creating the frame
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "See transaction",
        action: "link",
        target: `https://base-sepolia.blockscout.com/tx/${frameMessage.transactionId}`,
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
