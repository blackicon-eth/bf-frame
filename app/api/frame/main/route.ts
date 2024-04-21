import { NextRequest, NextResponse } from "next/server";
import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { FrameActionDataParsedAndHubContext } from "frames.js";
import { getErrorFrame } from "@/app/lib/getFrame";
import { getFriend, validateMessage } from "@/app/lib/utils";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the user data and validating it
  const data = await req.json();

  // Validating the frame message
  const { frameMessage, isValid }: { frameMessage: FrameActionDataParsedAndHubContext | undefined; isValid: boolean } =
    await validateMessage(data);
  if (!isValid) {
    console.log("NOT VALID!");
    return getErrorFrame(); // OR USE AN INVALID FRAME
  }

  // Getting caller username and caller propic from the frame message
  const callerUsername = frameMessage?.requesterUserData?.username ?? "";
  const callerPropic = frameMessage?.requesterUserData?.profileImage ?? "";
  const callerAddress = frameMessage?.requesterVerifiedAddresses[0] ?? "";

  // Getting caller's friend username and friend propic
  const {
    friendUsername,
    friendPropic,
    friendAddress,
    friendshipLevel,
  }: { friendUsername: string; friendPropic: string; friendAddress: string; friendshipLevel: string } = await getFriend(
    callerUsername
  );

  // Will be removed
  console.log("Frame caller username: ", callerUsername);
  console.log("Frame caller profile image: ", callerPropic);
  console.log("Frame caller address: ", callerAddress);
  console.log("Friend username: ", friendUsername);
  console.log("Friend propic: ", friendPropic);
  console.log("Friend address: ", friendAddress);
  console.log("Friendship level: ", friendshipLevel);

  //await nftStorageStoreAsset(); // This one is to store on nft.storage

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
    },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/main`,
  });

  return new NextResponse(frame);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
