import { NextRequest, NextResponse } from "next/server";
import { getInvalidFIDFrame } from "@/app/lib/getFrame";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { getFrameMessage } from "frames.js";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user fid and validating it
  const data = await req.json();
  const fid = data.untrustedData.fid;
  if (!fid && isNaN(fid) && parseInt(fid) < 0) {
    return getInvalidFIDFrame();
  }

  const frameMessage = await getFrameMessage(
    { trustedData: data.trustedData, untrustedData: data.untrustedData },
    {
      hubHttpUrl: "https://hub-api.neynar.com",
      hubRequestOptions: {
        headers: {
          api_key: "NEYNAR_FRAMES_JS",
        },
      },
    }
  );

  if (!process.env.NEXT_PUBLIC_BASE_URL || !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
    if (frameMessage && !frameMessage?.isValid) {
      throw new Error("Invalid frame payload");
    }
  }

  const frameCallerUsername = frameMessage?.requesterUserData?.username!;
  const frameCallerProfileImage = frameMessage?.requesterUserData?.profileImage!;

  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Mint for me",
        action: "post",
      },
      {
        label: "Mint for both",
        action: "post",
      },
    ],
    image: {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?callerUsername=${frameCallerUsername}&callerPropic=${frameCallerProfileImage}`,
    },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint`,
  });

  return new NextResponse(frame);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
