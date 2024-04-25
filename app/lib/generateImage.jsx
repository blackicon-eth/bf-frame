import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import sharp from "sharp";
import axios from "axios";

// Support function to take the first frame of a GIF
async function getPicture(url) {
  // Get the image as an ArrayBuffer
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const pngBuffer = await sharp(Buffer.from(response.data)).toFormat("png").toBuffer();
  const pngArrayBuffer = pngBuffer.buffer.slice(pngBuffer.byteOffset, pngBuffer.byteOffset + pngBuffer.byteLength);

  return pngArrayBuffer;
}

async function getImageData(_callerUsername, _callerPropic, _friendUsername, _friendPropic) {
  // Convert null or empty string to undefined
  const callerUsername = _callerUsername || "Not found...";
  const friendUsername = _friendUsername || "Not found...";
  const callerPropic =
    _callerPropic && _callerUsername
      ? await getPicture(_callerPropic)
      : `${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`;
  const friendPropic =
    _friendPropic && _friendUsername
      ? await getPicture(_friendPropic)
      : `${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`;

  // Get current date to show on the image
  const formattedDate = new Date().toLocaleDateString();

  const bgImage =
    !_callerUsername || !_friendUsername || !_callerPropic || !_friendPropic
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/frames/missing.png`
      : friendUsername == callerUsername
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/frames/yourself.png`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/frames/best_friends.png`;

  return { formattedDate, bgImage, callerUsername, friendUsername, callerPropic, friendPropic };
}

// Loading fonts
const gothamBoldItalic = join(process.cwd(), "public/fonts/GothamBoldItalic.ttf");
const gothamBoldItalicData = readFileSync(gothamBoldItalic);

export async function generateFriendImage(_callerUsername, _callerPropic, _friendUsername, _friendPropic) {
  // Getting the data in order to compose the image
  const { formattedDate, bgImage, callerUsername, friendUsername, callerPropic, friendPropic } = await getImageData(
    _callerUsername,
    _callerPropic,
    _friendUsername,
    _friendPropic
  );

  // Generate the image with Satori
  const svg = await satori(
    <div style={style.background}>
      <img src={bgImage} style={style.bgImage} />
      <div style={style.callerContainer}>
        <img src={callerPropic} style={style.imageFriend} />
        <span tw={style.twFriendName}>{callerUsername}</span>
      </div>
      <div style={style.friendContainer}>
        <img src={friendPropic} style={style.imageFriend} />
        <span tw={style.twFriendName}>{friendUsername}</span>
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
