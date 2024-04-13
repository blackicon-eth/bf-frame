import { NextRequest, NextResponse } from "next/server";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { getFrameMessage } from "frames.js";
import { getErrorFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user data and validating it
  const data = await req.json();

  // Getting the frame message
  const frameMessage = await getFrameMessage(
    { trustedData: data.trustedData, untrustedData: data.untrustedData },
    {
      hubHttpUrl: process.env.NEYNAR_HUB_URL!,
      hubRequestOptions: {
        headers: {
          api_key: process.env.NEYNAR_API_KEY!,
        },
      },
    }
  );

  // If the base url is not set or is not localhost, we need to validate the frame message
  if (!process.env.NEXT_PUBLIC_BASE_URL || !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
    if (!frameMessage || !frameMessage.isValid) {
      return getErrorFrame(); // OR USE AN INVALID FRAME
    }
  }

  // Getting caller username and caller propic from the frame message
  const frameCallerUsername = frameMessage?.requesterUserData?.username!;
  const frameCallerProfileImage = frameMessage?.requesterUserData?.profileImage!;

  // Creating the frame
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Mint for me",
        action: "tx",
        target: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint?friendAddress=0x0000000000000000000000000000000000000000`,
        //postUrl: "",
      },
      {
        label: "Mint for both",
        action: "tx",
        target: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint?friendAddress=0x0000000000000000000000000000000000000000`,
        //postUrl: "",
      },
    ],
    image: {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?callerUsername=${frameCallerUsername}&callerPropic=${frameCallerProfileImage}`,
    },
    //post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint`,
  });

  return new NextResponse(frame);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
