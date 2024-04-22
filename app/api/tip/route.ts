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

  // Validating the frame message
  const { frameMessage, isValid } = await validateMessage(body);
  if (!isValid || !frameMessage) {
    return new NextResponse("Message not valid", { status: 500 });
  }

  // Getting the amount the user wants to tip
  const tipAmount = frameMessage.inputText;

  if (!tipAmount) {
    return new NextResponse("Amount not valid", { status: 500 });
  }

  // Building the transaction as a FrameTransactionResponse
  const tx: FrameTransactionResponse = {
    chainId: `eip155:${baseSepolia.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: FarcasterBestFriendsABI as Abi,
      to: BFF_ADDRESS, // The contract address deployed on Base Sepolia
      value: "0",
    },
  };

  return NextResponse.json(tx);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
