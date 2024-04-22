import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Find your BFF",
      action: "post",
    },
  ],
  image: { src: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/front_image.png`, aspectRatio: "1:1" },
  post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/main`,
});

export const metadata: Metadata = {
  title: "Best Friend Frame",
  description:
    "A farcaster frame that lets you find the person you engaged the most with and mint an NFT representing your friendship.",
  openGraph: {
    title: "Best Friend Frame",
    description:
      "A farcaster frame that lets you find the person you engaged the most with and mint an NFT representing your friendship.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/frames/front_image.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default async function Page() {
  return (
    <>
      <h1>BFF - Best Friend Frame</h1>
    </>
  );
}
