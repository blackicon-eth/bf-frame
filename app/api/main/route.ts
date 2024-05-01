import { NextRequest, NextResponse } from "next/server";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { FrameActionDataParsedAndHubContext } from "frames.js";
import { getInvalidFidFrame, getPinataLimitFrame } from "@/app/lib/getFrame";
import { countPinataPins, getFriend, validateMessage } from "@/app/lib/utils";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user data and validating it
  const data = await req.json();

  // Validating the frame message
  const { frameMessage, isValid }: { frameMessage: FrameActionDataParsedAndHubContext | undefined; isValid: boolean } =
    await validateMessage(data);
  if (!isValid || !frameMessage) {
    return getInvalidFidFrame();
  }

  if ((await countPinataPins()) >= 475) {
    console.error("Pinata limit reached");
    return getPinataLimitFrame();
  }

  // Getting caller info from the frame message
  const callerUsername = frameMessage.requesterUserData?.username ?? "";
  const callerPropic = frameMessage.requesterUserData?.profileImage ?? "";
  const callerAddress = frameMessage.requesterVerifiedAddresses[0] ?? frameMessage.requesterCustodyAddress ?? ""; // Validated address is preferred over custody address
  const callerFid = frameMessage.requesterFid ?? "";

  // Getting caller's friend username and friend propic
  const {
    friendUsername,
    friendPropic,
    friendAddress,
    friendshipLevel,
  }: { friendUsername: string; friendPropic: string; friendAddress: string; friendshipLevel: string } = await getFriend(
    callerFid
  );

  // Creating the frame
  const frame = getFrameHtmlResponse({
    buttons:
      callerUsername && callerAddress && callerPropic && friendUsername && friendAddress && friendPropic && friendshipLevel
        ? [
            {
              label: "Mint for me",
              action: "tx",
              target: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}&callerAddress=${callerAddress}&friendAddress=0x0000000000000000000000000000000000000000`,
              postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/post_transaction?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}`,
            },
            {
              label: "Mint for both",
              action: "tx",
              target: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mint?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}&callerAddress=${callerAddress}&friendAddress=${friendAddress}`,
              postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/post_transaction?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}`,
            },
          ]
        : [
            {
              label: "Retry",
              action: "post",
            },
          ],
    image: {
      src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}`,
      aspectRatio: "1:1",
    },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/main`,
  });

  return new NextResponse(frame);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
