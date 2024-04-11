import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextResponse } from "next/server";

export function getErrorFrame(): NextResponse {
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: "Retry",
        action: "post",
      },
    ],
    image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/front_image.jpg` },
    post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/main`,
  });

  return new NextResponse(frame);
}
