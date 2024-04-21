import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import { pinImageOnPinata, pinJsonOnPinata, calculateCID } from "@/app/lib/utils";
import sharp from "sharp";
import { Readable } from "stream";

// Loading fonts
const gothamBoldItalic = join(process.cwd(), "public/fonts/GothamBoldItalic.ttf");
const gothamBoldItalicData = readFileSync(gothamBoldItalic);

export async function generateFriendImage(_callerUsername, _callerPropic, _friendUsername, _friendPropic) {
  // Convert null or empty string to undefined
  const callerUsername = _callerUsername || undefined;
  const callerPropic = _callerPropic || undefined;
  const friendUsername = _friendUsername || undefined;
  const friendPropic = _friendPropic || undefined;

  // Get current date to show on the image
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();

  const upperText =
    !callerUsername || !friendUsername || !callerPropic || !friendPropic
      ? "It looks like one of you is missing..."
      : friendUsername == callerUsername
      ? "Your best friend is... yourself?!"
      : "It looks like you two are Farcaster best friends!";

  // Generate the image with Satori
  const svg = await satori(
    <div style={{ ...style.background, backgroundColor: "#7e5bc0" }}>
      <span tw={style.mainText}>{upperText}</span>
      <div style={style.mainContainer}>
        <div style={style.friendContainer}>
          {callerPropic ? (
            <img src={callerPropic} style={style.imageFriend} />
          ) : (
            <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`} style={style.imageFriend} />
          )}

          <span tw={style.twFriendName}>{callerUsername ? callerUsername : "Not found..."}</span>
        </div>

        <div style={style.friendContainer}>
          {friendPropic ? (
            <img src={friendPropic} style={style.imageFriend} />
          ) : (
            <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`} style={style.imageFriend} />
          )}
          <span tw={style.twFriendName}>{friendUsername ? friendUsername : "Not found..."}</span>
        </div>
      </div>
      <span tw={style.twDate} style={style.date}>
        Created on {formattedDate}
      </span>
    </div>,
    {
      width: 1910,
      height: 1000,
      fonts: [
        {
          data: gothamBoldItalicData,
          name: "GothamBoldItalic",
        },
      ],
    }
  );

  console.log("SVG generated successfully");

  const sharpPNG = sharp(Buffer.from(svg)).toFormat("png");
  const buffer = await sharpPNG.toBuffer();

  // Save the image to the file system if we are running locally
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
    const outputPath = join(process.cwd(), "public/frames/test.png");
    await sharpPNG.toFile(outputPath);
  }

  return buffer;
}
