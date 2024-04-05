import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getFunFactFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();

  // Getting the pressed button ID
  const buttonId = data.untrustedData.buttonIndex;

  // Go back
  if (buttonId === 1) {
    return getMainFrame();
  }

  //Another one!
  else {
    const randomId = (Math.floor(Math.random() * 22) + 1).toString();
    return getFunFactFrame(randomId);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
