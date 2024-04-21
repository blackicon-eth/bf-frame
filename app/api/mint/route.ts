import { NextRequest, NextResponse } from "next/server";
import { Abi, Address, encodeFunctionData } from "viem";
import { base, baseSepolia } from "viem/chains";
import { FarcasterBestFriendsABI } from "@/app/lib/abi/FarcasterBestFriendsABI";
import { BFF_ADDRESS } from "@/app/lib/constants/constants";
import { approve, calculateCID, validateMessage } from "@/app/lib/utils";
import { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { generateFriendImage } from "@/app/lib/generateImage";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the frame request
  const body = await req.json();

  // Getting the number on mints from the nextUrl
  const callerAddress: Address = req.nextUrl.searchParams.get("callerAddress")! as Address;
  const friendAddress: Address = req.nextUrl.searchParams.get("friendAddress")! as Address;
  const callerUsername = req.nextUrl.searchParams.get("callerUsername")!;
  const callerPropic = req.nextUrl.searchParams.get("callerPropic")!;
  const friendUsername = req.nextUrl.searchParams.get("friendUsername")!;
  const friendPropic = req.nextUrl.searchParams.get("friendPropic")!;
  const friendshipLevel = req.nextUrl.searchParams.get("friendshipLevel")!;

  const imageBuffer = await generateFriendImage(callerUsername, callerPropic, friendUsername, friendPropic);
  const { imageCid, jsonCid } = await calculateCID(imageBuffer, friendUsername, callerUsername, friendshipLevel);

  console.log("JSON CID: ", jsonCid);
  console.log("Image CID: ", imageCid);

  // Validating the frame message
  const { isValid } = await validateMessage(body);
  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  const signature = await approve(jsonCid, callerAddress, friendAddress);

  // Getting the encoded data to build the transaction
  const data = encodeFunctionData({
    abi: FarcasterBestFriendsABI, // ABI of the contract
    functionName: "safeMint",
    args: [
      {
        uri: jsonCid,
        minter: callerAddress,
        friend: friendAddress,
        signature: signature as Address,
      },
    ],
  });

  // Building the transaction as a FrameTransactionResponse
  const tx: FrameTransactionResponse = {
    chainId: `eip155:${baseSepolia.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: FarcasterBestFriendsABI as Abi,
      to: BFF_ADDRESS, // The contract address deployed on Base Sepolia
      data: data,
      value: "0",
    },
  };

  //console.log("\nTx created: ", tx, "\n");
  console.log("Signature: ", signature as Address);

  return NextResponse.json(tx);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
