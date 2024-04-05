import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const gender = req.nextUrl.searchParams.get("gender")!;
  const waist = req.nextUrl.searchParams.get("waist")!;
  const neck = req.nextUrl.searchParams.get("neck")!;

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
      "hips_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/hips?gender=${gender}&waist=${waist}&neck=${neck}`
    );
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 170 || parseFloat(inputText) < 30)) {
    return getMetricFrame(
      "Enter size between 30 and 170",
      "hips_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/hips?gender=${gender}&waist=${waist}&neck=${neck}`
    );
  }

  // Next
  return getMetricFrame(
    "What's your height? (Cm)",
    "height_image",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/height?gender=${gender}&waist=${waist}&neck=${neck}&hips=${inputText}`
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
