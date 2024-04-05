import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const gender = req.nextUrl.searchParams.get("gender")!;

  // Getting the pressed button ID
  const buttonId = data.untrustedData.buttonIndex;

  // Start Over
  if (buttonId === 1) {
    return getMainFrame();
  }

  // Getting the text input
  const inputText = data.untrustedData.inputText;
  const isValidTextInput = !isNaN(inputText) && parseFloat(inputText) > 0;

  // If the input is not valid
  if (!isValidTextInput) {
    return getMetricFrame(
      "Invalid input!",
      "waist_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/waist?gender=${gender}`
    );
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 300 || parseFloat(inputText) < 20)) {
    return getMetricFrame(
      "Enter size between 20 and 300",
      "waist_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/waist?gender=${gender}`
    );
  }

  // Next
  return getMetricFrame(
    "What's your neck circumf.? (Cm)",
    "neck_image",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/neck?gender=${gender}&waist=${inputText}`
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
