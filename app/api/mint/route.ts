import { FrameRequest, FrameValidationData } from "@coinbase/onchainkit";
import { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseGwei } from "viem";
import { base, baseSepolia } from "viem/chains";

const getFarcasterAccountAddress = (interactor: FrameValidationData["interactor"]) => {
  // Get the first verified account or the custody address
  return interactor.verified_accounts[0] ?? interactor.custody_address;
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the frame request
  const body = await req.json();

  console.log("body", body);

  // Getting the number on mints from the nextUrl
  const number = req.nextUrl.searchParams.get("number")!;

  // Getting the frame message
  const frameMessage = await getFrameMessage(
    { trustedData: body.trustedData, untrustedData: body.untrustedData },
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
      return new NextResponse("Message not valid", { status: 500 });
    }
  }

  // Getting the encoded data to build the transaction
  const data = encodeFunctionData({
    abi: ClickTheButtonABI, // ABI of the contract
    functionName: "clickTheButton",
  });

  const txData: FrameTransactionResponse = {
    chainId: `eip155:${baseSepolia.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: [],
      data,
      to: CLICK_THE_BUTTON_CONTRACT_ADDR,
      value: parseGwei("10000").toString(), // 0.00001 ETH
    },
  };

  return new NextResponse(JSON.stringify(txData), { status: 200 });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
