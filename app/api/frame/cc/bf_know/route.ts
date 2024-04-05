import { NextRequest, NextResponse } from "next/server";
import { getGenderFrame, getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();

  // Getting the pressed button ID
  const buttonId = data.untrustedData.buttonIndex;

  // Start Over
  if (buttonId === 1) {
    return getMainFrame();
  }

  // Body Fat % not known
  else if (buttonId === 2) {
    return getGenderFrame("gender_image", `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/gender?bf_know=no`);
  }

  // Body Fat % known
  else {
    return getMetricFrame(
      "What's your body fat %? (1-70)",
      "bf_perc_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/bf?bf_know=yes`
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
