import { NextRequest, NextResponse } from "next/server";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { FrameActionDataParsedAndHubContext } from "frames.js";
import { getInvalidFidFrame, getPinLimitFrame } from "@/app/lib/getFrame";
import { getFriend, getPinCount, validateMessage } from "@/app/lib/utils";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user data and validating it
  const data = await req.json();

  // Validating the frame message
  const { frameMessage, isValid }: { frameMessage: FrameActionDataParsedAndHubContext | undefined; isValid: boolean } =
    await validateMessage(data);
  if (!isValid || !frameMessage) {
    return getInvalidFidFrame();
  }

  if ((await getPinCount()) >= 475) {
    return getPinLimitFrame();
  }

  console.log("\nFrame message: ", frameMessage, "\n");

  // Getting caller info from the frame message
  const callerUsername = frameMessage.requesterUserData?.username ?? "";
  const callerPropic = frameMessage.requesterUserData?.profileImage ?? "";
  const callerAddress = frameMessage.requesterVerifiedAddresses[0] ?? frameMessage.requesterCustodyAddress ?? ""; // Validated address is preferred over custody address
  const callerFid = frameMessage.requesterFid ?? "";

  // Getting caller's friend info
  const {
    friendUsername,
    friendPropic,
    friendAddress,
    friendshipLevel,
  }: { friendUsername: string; friendPropic: string; friendAddress: string; friendshipLevel: string } = await getFriend(
    callerFid
  );

  // Some logs for debugging
  console.log("\nFrame caller username: ", callerUsername);
  console.log("Frame caller profile image: ", callerPropic);
  console.log("Frame caller address: ", callerAddress);
  console.log("Friend username: ", friendUsername);
  console.log("Friend propic: ", friendPropic);
  console.log("Friend address: ", friendAddress);
  console.log("Friendship level: ", friendshipLevel, "\n");

  // Creating the frame
  const frame = getFrameHtmlResponse({
    buttons:
      callerUsername && callerAddress && callerPropic && friendUsername && friendAddress && friendPropic && friendshipLevel
        ? [
            {
              label: "Mint for me",
              action: "tx",
              target: `${
                process.env.NEXT_PUBLIC_BASE_URL
              }/api/mint?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}&callerAddress=${"0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2"}&friendAddress=0x0000000000000000000000000000000000000000`,
              postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/post_transaction?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}`,
            },
            {
              label: "Mint for both",
              action: "tx",
              target: `${
                process.env.NEXT_PUBLIC_BASE_URL
              }/api/mint?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}&callerAddress=${"0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2"}&friendAddress=${friendAddress}`,
              postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/post_transaction?callerUsername=${callerUsername}&callerPropic=${callerPropic}&friendUsername=${friendUsername}&friendPropic=${friendPropic}&friendshipLevel=${friendshipLevel}`,
            },
            {
              label: "Share!",
              action: "link",
              target:
                "https://warpcast.com/~/compose?text=Find%20your%20farcaster%20best%20friend!%0A%0Ahttps://bf-frame.vercel.app/",
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
