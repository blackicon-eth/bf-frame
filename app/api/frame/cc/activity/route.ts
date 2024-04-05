import { NextRequest, NextResponse } from "next/server";
import { getCCFrame, getMainFrame, getMetricFrame } from "@/app/lib/getFrame";
import { parse } from "path";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const bf = req.nextUrl.searchParams.get("bf")!;
  const bf_know = req.nextUrl.searchParams.get("bf_know")!;
  const gender = req.nextUrl.searchParams.get("gender")!;
  const weight = req.nextUrl.searchParams.get("weight")!;

  // Getting the pressed button ID
  const buttonId = data.untrustedData.buttonIndex;

  // Start Over
  if (buttonId === 1) {
    return getMainFrame();
  }

  // Getting the text input
  const inputText = data.untrustedData.inputText;
  const isValidTextInput = !isNaN(inputText) && parseInt(inputText) > 0 && parseInt(inputText) < 6;

  // If the input is not valid
  if (!isValidTextInput) {
    if (bf_know === "yes") {
      return getMetricFrame(
        "Insert a number between 1 and 5!",
        "activity_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/activity?bf_know=yes&bf=${bf}&weight=${weight}`
      );
    } else {
      return getMetricFrame(
        "Insert a number between 1 and 5!",
        "activity_image",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/activity?bf_know=no&gender=${gender}&weight=${weight}`
      );
    }
  }

  // Next
  if (bf_know === "yes") {
    // Activity level multiplier
    const activityMultiplier =
      parseInt(inputText) == 1
        ? 1.2
        : parseInt(inputText) == 2
        ? 1.35
        : parseInt(inputText) == 3
        ? 1.5
        : parseInt(inputText) == 4
        ? 1.65
        : 1.8;

    // Calculate the calories with katch-mcardle formula
    const calculatedCalories = (370 + 21.6 * parseFloat(weight) * (1 - parseFloat(bf) / 100)) * activityMultiplier;
    return getCCFrame(calculatedCalories.toFixed(0).toString());
  } else {
    return getMetricFrame(
      "What's your height? (Cm)",
      "height_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/height?bf_know=no&gender=${gender}&weight=${weight}&activity=${inputText}`
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
