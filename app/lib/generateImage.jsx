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

export async function generateFriendImage(
  callerUsername,
  callerPropic,
  friendUsername,
  friendPropic,
  friendshipLevel = false,
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

  // If onlyCID is true, we calculate the CID and return it
  if (true) {
    //onlyCID && friendshipLevel) {
    const imageCid = await calculateCID(buffer);

    const json = {
      description:
        friendUsername == callerUsername
          ? `As strange as it may seem, it looks like that ${callerUsername}'s best friend is himself/herself`
          : `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
      image: imageCid,
      name:
        friendUsername == callerUsername
          ? `${callerUsername} and ${friendUsername}... are Farcaster best friends?!`
          : `${callerUsername} and ${friendUsername} are Farcaster best friends!`,
      attributes: {
        trait_type: "Friendship level",
        value: friendshipLevel,
      },
    };

    const jsonCid = await calculateCID(Buffer.from(JSON.stringify(json)));

    console.log("JSON CID: ", jsonCid);
    console.log("Image CID: ", imageCid);
    //return { jsonCid, imageCid };
  }
  // If onlyPin is true, we pin the image to Pinata and return the pin
  if (true) {
    //onlyPin && friendshipLevel) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    const imageHash = await pinImageOnPinata(stream);

    const json = {
      description:
        friendUsername == callerUsername
          ? `As strange as it may seem, it looks like that ${callerUsername}'s best friend is himself/herself`
          : `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
      image: imageHash.IpfsHash,
      name:
        friendUsername == callerUsername
          ? `${callerUsername} and ${friendUsername}... are Farcaster best friends?!`
          : `${callerUsername} and ${friendUsername} are Farcaster best friends!`,
      attributes: {
        trait_type: "Friendship level",
        value: friendshipLevel,
      },
    };

    const jsonHash = await pinJsonOnPinata(json);

    console.log("Pinned image: ", imageHash);
    console.log("Pinned json: ", jsonHash);
    //return { jsonHash, imageHash };
  }
  // Otherwise, we return the buffer
  return buffer;
}
