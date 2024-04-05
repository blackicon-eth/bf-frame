import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();

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
      "bf_perc_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/bf?bf_know=yes`
    );
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 70 || parseFloat(inputText) < 1)) {
    return getMetricFrame(
      "Enter percent. between 1 and 70",
      "bf_perc_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/bf?bf_know=yes`
    );
  }

  // Next
  return getMetricFrame(
    "What's your body weight? (Kg)",
    "weight_image",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/weight?bf_know=yes&bf=${inputText}`
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
