import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const gender = req.nextUrl.searchParams.get("gender")!;
  const waist = req.nextUrl.searchParams.get("waist")!;

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
      "neck_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/neck?gender=${gender}&waist=${waist}`
    );
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 80 || parseFloat(inputText) < 10)) {
    return getMetricFrame(
      "Enter size between 10 and 80",
      "neck_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/neck?gender=${gender}&waist=${waist}`
    );
  }

  // Next
  // Male
  if (gender === "male") {
    return getMetricFrame(
      "What's your height? (Cm)",
      "height_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/height?gender=${gender}&waist=${waist}&neck=${inputText}`
    );
  }

  // Female
  else {
    return getMetricFrame(
      "What's your hips circumf.? (Cm)",
      "hips_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/hips?gender=${gender}&waist=${waist}&neck=${inputText}`
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
