import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import sharp from "sharp";

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

  const bgImage =
    !callerUsername || !friendUsername || !callerPropic || !friendPropic
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/frames/missing.png`
      : friendUsername == callerUsername
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/frames/yourself.png`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/frames/best_friends.png`;

  // Generate the image with Satori
  const svg = await satori(
    <div style={style.background}>
      <img src={bgImage} style={style.bgImage} />
      <div style={style.callerContainer}>
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
      <span tw={style.twDate} style={style.date}>
        Created on {formattedDate}
      </span>
    </div>,
    {
      width: 1500,
      height: 1500,
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
    const outputPath = join(process.cwd(), "public/test.png");
    await sharpPNG.toFile(outputPath);
  }

  return buffer;
}
