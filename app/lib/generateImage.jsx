import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import sharp from "sharp";
import axios from "axios";

// Support function to take the first frame of a GIF
async function checkAndGetPicture(pictureUrl, username) {
  if (pictureUrl && username) {
    try {
      // Get the image as an ArrayBuffer
      var response = await axios.get(pictureUrl, {
        responseType: "arraybuffer",
      });
    } catch {
      return { buffer: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`, found: false };
    }
    // Convert the image to PNG and return it as an ArrayBuffer
    const pngBuffer = await sharp(Buffer.from(response.data)).toFormat("png").toBuffer();
    const pngArrayBuffer = pngBuffer.buffer.slice(pngBuffer.byteOffset, pngBuffer.byteOffset + pngBuffer.byteLength);

    return { buffer: pngArrayBuffer, found: true };
  }
  return { buffer: `${process.env.NEXT_PUBLIC_BASE_URL}/frames/not_found.png`, found: false };
}

// Support function to get the data to compose the image
async function getImageData(_callerUsername, _callerPropic, _friendUsername, _friendPropic) {
  // Get the data to compose the image
  const callerUsername = !_callerUsername || !_callerPropic ? "Not found..." : _callerUsername;
  const friendUsername = !_friendUsername || !_friendPropic ? "Not found..." : _friendUsername;
  const callerPropic = await checkAndGetPicture(_callerPropic, _callerUsername);
  const friendPropic = await checkAndGetPicture(_friendPropic, _friendUsername);

  // Get current date to show on the image
  const formattedDate = new Date().toLocaleDateString();

  // Get the background image
  const bgImage =
    !_callerUsername || !_friendUsername || !callerPropic.found || !friendPropic.found
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/frames/missing.png`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/frames/best_friends.png`;

  return { formattedDate, bgImage, callerUsername, friendUsername, callerPropic, friendPropic };
}

// Support function to get a font
function getFont(location) {
  // Loading fonts
  const font = join(process.cwd(), location);
  return readFileSync(font);
}

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
        <img src={callerPropic.buffer} style={style.imageFriend} />
        <span tw={style.twFriendName}>{callerUsername}</span>
      </div>
      <div style={style.friendContainer}>
        <img src={friendPropic.buffer} style={style.imageFriend} />
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
          data: getFont("public/fonts/GothamBoldItalic.ttf"),
          name: "GothamBoldItalic",
        },
      ],
    }
  );

  const sharpPNG = sharp(Buffer.from(svg)).toFormat("png");
  const buffer = await sharpPNG.toBuffer();

  // Save the image to the file system if we are running locally
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
    const outputPath = join(process.cwd(), "public/test.png");
    await sharpPNG.toFile(outputPath);
  }

  return buffer;
}
