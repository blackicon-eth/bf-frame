import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextResponse } from "next/server";

export function getFunFactFrame(randomId: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Go back",
        action: "post",
      },
      {
        label: "Another one!",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/fun_facts/${randomId}.jpg` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/fun_fact`,
  });

  return new NextResponse(frame);
}

export function getMainFrame(): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Kcals",
        action: "post",
      },
      {
        label: "BMI",
        action: "post",
      },
      {
        label: "Body Fat %",
        action: "post",
      },
      {
        label: "Fun Facts",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/front_image.jpg` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/main`,
  });

  return new NextResponse(frame);
}

export function getInvalidFIDFrame(): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/invalid_fid_image.jpg` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/start_over`,
  });

  return new NextResponse(frame);
}

export function getMetricFrame(textPlaceholder: string, image: string, post_url: string): NextResponse {
  const frame = getFrameHtmlResponse({
    input: { text: textPlaceholder },
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
      {
        label: "Next",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/${image}.jpg` },
    post_url: `${post_url}`,
  });

  return new NextResponse(frame);
}

export function getGenderFrame(image: string, post_url: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
      {
        label: "Female",
        action: "post",
      },
      {
        label: "Male",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/${image}.jpg` },
    post_url: `${post_url}`,
  });

  return new NextResponse(frame);
}

export function getKnowBFFrame(image: string, post_url: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
      {
        label: "No idea!",
        action: "post",
      },
      {
        label: "Yes, I know it!",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/${image}.jpg` },
    post_url: `${post_url}`,
  });

  return new NextResponse(frame);
}

export function getBMIFrame(calculatedBMI: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?event=bmi&value=${calculatedBMI}` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/start_over`,
  });

  return new NextResponse(frame);
}

export function getBFFrame(calculatedBF: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?event=bf&value=${calculatedBF}` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/start_over`,
  });

  return new NextResponse(frame);
}

export function getCCFrame(calculatedCalories: string): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Start Over",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?event=cc&value=${calculatedCalories}` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/start_over`,
  });

  return new NextResponse(frame);
}
