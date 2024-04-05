import { NextRequest, NextResponse } from "next/server";
import { getCCFrame, getMainFrame, getMetricFrame } from "@/app/lib/getFrame";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Getting the request payload
  const data = await req.json();
  const gender = req.nextUrl.searchParams.get("gender")!;
  const weight = req.nextUrl.searchParams.get("weight")!;
  const height = req.nextUrl.searchParams.get("height")!;
  const activity = req.nextUrl.searchParams.get("activity")!;

  // Getting the pressed button ID
  const buttonId = data.untrustedData.buttonIndex;

  // Start Over
  if (buttonId === 1) {
    return getMainFrame();
  }

  // Getting the text input
  const inputText = data.untrustedData.inputText;
  const isValidTextInput = !isNaN(inputText) && parseInt(inputText) > 10 && parseInt(inputText) < 120;

  // If the input is not valid
  if (!isValidTextInput) {
    return getMetricFrame(
      "Enter an age between 10 and 120!",
      "age_image",
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/cc/age?bf_know=no&gender=${gender}&weight=${weight}&height=${height}&activity=${activity}`
    );
  }

  // Next
  // Activity level multiplier
  const activityMultiplier =
    parseInt(activity) == 1
      ? 1.2
      : parseInt(activity) == 2
      ? 1.35
      : parseInt(activity) == 3
      ? 1.5
      : parseInt(activity) == 4
      ? 1.65
      : 1.8;

  // Calculate BMR with Mifflin-St Jeor Formula
  // Male
  if (gender === "male") {
    var calculatedCalories =
      (10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(inputText) + 5) * activityMultiplier;
  } else {
    var calculatedCalories =
      (10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(inputText) - 161) * activityMultiplier;
  }
  return getCCFrame(calculatedCalories.toFixed(0).toString());
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
