import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import { pinOnPinata, calculateCID } from "@/app/lib/utils";
import sharp from "sharp";
import { Readable } from "stream";

// Loading fonts
const gothamBoldItalic = join(process.cwd(), "public/fonts/GothamBoldItalic.ttf");
const gothamBoldItalicData = readFileSync(gothamBoldItalic);

export async function generateFriendImage(
  callerUsername,
  callerPropic,
  friendUsername,
  friendPropic,
  onlyCID = false,
  onlyPin = false
) {
  // Get current date to show on the image
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();

  // Generate the image with Satori
  const svg = await satori(
    <div style={{ ...style.background, backgroundColor: "#7e5bc0" }}>
      <span tw={style.mainText}>
        {friendUsername == callerUsername
          ? "Your best friend is... yourself?!"
          : "It looks like you two are Farcaster best friends!"}
      </span>
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

  const json_test = {
    description: "Friendly OpenSea Creature that enjoys long swims in the ocean.",
    external_url: "https://openseacreatures.io/3",
    image: "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
    name: "Dave Starbelly",
    attributes: {
      trait_type: "Base",
      value: "Starfish",
    },
  };

  // If onlyCID is true, we calculate the CID and return it
  if (onlyCID) {
    const imageCid = await calculateCID(buffer);
    console.log("Image CID: ", imageCid);

    const jsonCid = await calculateCID(Buffer.from(JSON.stringify(json_test)));
    console.log("JSON CID: ", jsonCid);
  }
  // If onlyPin is true, we pin the image to Pinata and return the pin
  else if (onlyPin) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const { jsonHash, imageHash } = await pinOnPinata(json_test, stream);
    console.log("Pinned image: ", imageHash);
    console.log("Pinned json: ", jsonHash);
    return { jsonHash, imageHash };
  }
  // Otherwise, we return the buffer
  return buffer;
}
