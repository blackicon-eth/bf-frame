import { FrameRequest, FrameValidationData, getFrameMessage } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";

const getFarcasterAccountAddress = (interactor: FrameValidationData["interactor"]) => {
  // Get the first verified account or the custody address
  return interactor.verified_accounts[0] ?? interactor.custody_address;
};

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the frame request
  const data: FrameRequest = await req.json();

  // Getting the number on mints from the nextUrl
  const number = req.nextUrl.searchParams.get("number")!;

  // Getting the frame message and validity
  const { message, isValid } = await getFrameMessage(data, { neynarApiKey: "NEYNAR_ONCHAIN_KIT" });

  // If the message is not valid, return an error
  if (!isValid) {
    return new NextResponse("Message not valid", { status: 500 });
  }
  return new NextResponse("Message is valid", { status: 200 });
  // TODO
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
