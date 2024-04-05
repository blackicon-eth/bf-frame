import { NextRequest, NextResponse } from "next/server";
import { getBFFrame, getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const gender = req.nextUrl.searchParams.get("gender")!;
  const waist = req.nextUrl.searchParams.get("waist")!;
  const neck = req.nextUrl.searchParams.get("neck")!;
  const hips = req.nextUrl.searchParams.get("hips")!;

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
      "height_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/height?gender=${gender}&waist=${waist}&neck=${neck}&hips=${hips}`
    );
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 300 || parseFloat(inputText) < 100)) {
    return getMetricFrame(
      "Enter height between 100 and 300",
      "height_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/bf/height?gender=${gender}&waist=${waist}&neck=${neck}&hips=${hips}`
    );
  }

  // Next
  if (gender === "male") {
    var calculatedBF = (
      495 /
        (1.0324 - 0.19077 * Math.log10(parseFloat(waist) - parseFloat(neck)) + 0.15456 * Math.log10(parseFloat(inputText))) -
      450
    ).toFixed(1);
  } else {
    var calculatedBF = (
      495 /
        (1.29579 -
          0.35004 * Math.log10(parseFloat(waist) + parseFloat(hips) - parseFloat(neck)) +
          0.221 * Math.log10(parseFloat(inputText))) -
      450
    ).toFixed(1);
  }
  return getBFFrame(calculatedBF);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
