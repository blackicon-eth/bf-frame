import { NextRequest, NextResponse } from "next/server";
import { getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const bf = req.nextUrl.searchParams.get("bf")!;
  const bf_know = req.nextUrl.searchParams.get("bf_know")!;
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
    if (bf_know === "yes") {
      return getMetricFrame(
        "Invalid input!",
        "weight_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/weight?bf_know=yes&bf=${bf}`
      );
    } else {
      return getMetricFrame(
        "Invalid input!",
        "weight_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/weight?bf_know=no&gender=${gender}`
      );
    }
  }

  // If the input is valid but out of range
  else if (isValidTextInput && (parseFloat(inputText) > 400 || parseFloat(inputText) < 20)) {
    if (bf_know === "yes") {
      return getMetricFrame(
        "Enter weight between 20 and 400",
        "weight_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/weight?bf_know=yes&bf=${bf}`
      );
    } else {
      return getMetricFrame(
        "Enter weight between 20 and 400",
        "weight_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/weight?bf_know=no&gender=${gender}`
      );
    }
  }

  // Next
  if (bf_know === "yes") {
    return getMetricFrame(
      "Select your activity level",
      "activity_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/activity?bf_know=yes&bf=${bf}&weight=${inputText}`
    );
  } else {
    return getMetricFrame(
      "Select your activity level",
      "activity_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/activity?bf=no&gender=${gender}&weight=${inputText}`
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
