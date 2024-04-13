import { FrameRequest, FrameValidationData } from "@coinbase/onchainkit";
import { FrameTransactionResponse } from "@coinbase/onchainkit/frame";
import { getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { Address, encodeFunctionData, parseGwei } from "viem";
import { base, baseSepolia } from "viem/chains";
import { FarcasterBestFriendsABI } from "@/app/lib/abi/FarcasterBestFriendsABI";
import { ethers } from "ethers";

const getFarcasterAccountAddress = (interactor: FrameValidationData["interactor"]) => {
  // Get the first verified account or the custody address
  return interactor.verified_accounts[0] ?? interactor.custody_address;
};

const SIGNING_DOMAIN_NAME = "Voucher-Domain";
const SIGNING_DOMAIN_VERSION = "1";
const chainId = baseSepolia.id;

const domain = {
  name: SIGNING_DOMAIN_NAME,
  version: SIGNING_DOMAIN_VERSION,
  verifyingContract: "0xfC8Bcec7118CAd2E86cDf7f36A13f79324f743fE", // The contract address deployed on Base Sepolia
  chainId,
};

const approve = async (uri: string, minter: Address, friend: Address) => {
  const voucher = { uri, minter, friend };

  const types = {
    Voucher: [
      { name: "uri", type: "string" },
      { name: "minter", type: "address" },
      { name: "friend", type: "address" },
    ],
  };

  try {
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY! as Address);
    const signature = await signer.signTypedData(domain, types, voucher);

    return signature as Address;
  } catch (err) {
    console.log(err);
  }
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the frame request
  const body = await req.json();

  console.log("body", body);

  // Getting the number on mints from the nextUrl
  const friendAddress: Address = req.nextUrl.searchParams.get("friendAddress")! as Address;

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

  const signature = await approve(
    "https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi/5.json",
    "0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2",
    friendAddress
  );

  // Getting the encoded data to build the transaction
  const data = encodeFunctionData({
    abi: FarcasterBestFriendsABI, // ABI of the contract
    functionName: "safeMint",
    args: [
      {
        uri: "https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi/5.json",
        minter: "0xf2E19F606a775c02D785d4c2f4b7BCbb2Dfc21F2",
        friend: friendAddress,
        signature: signature!, // TO CHANGE
      },
    ],
  });

  // Building the transaction as a FrameTransactionResponse
  const tx: FrameTransactionResponse = {
    chainId: `eip155:${baseSepolia.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: FarcasterBestFriendsABI,
      data,
      to: "0xfC8Bcec7118CAd2E86cDf7f36A13f79324f743fE", // The contract address deployed on Base Sepolia
      value: parseGwei("0").toString(),
    },
  };

  return new NextResponse(JSON.stringify(tx), { status: 200 });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
