import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import sharp from "sharp";
import axios from "axios";
import { init, fetchQuery } from "@airstack/node";

init(process.env.AIRSTACK_KEY);

const query = `query GetPropicsQuery($fname: String) {
  Socials(
    input: {
      filter: {
        profileName: { _eq: $fname }
        dappName: { _eq: farcaster }
      }
      blockchain: ethereum
    }
  ) {
    Social {
      profileImage
      profileImageContentValue {
        image {
          small
        }
      }
    }
  }
}`;

// Loading fonts
const gothamBoldItalic = join(process.cwd(), "public/fonts/GothamBoldItalic.ttf");
const gothamBoldItalicData = readFileSync(gothamBoldItalic);

export async function generateFriendImage(callerUsername, callerPropic) {
  var friendPropic;
  var friendName;

  // Get friend's name and propic through API calls
  if (callerUsername && callerPropic) {
    try {
      const response = await axios.post("https://graph.cast.k3l.io/links/engagement/handles?limit=1", [callerUsername]);
      console.log("response:", response.data.result);
      if (response.data.result[0]) {
        const element = response.data.result[0];
        friendName = element.fname.toString();
        const { data, error } = await fetchQuery(query, { fname: friendName });
        if (data.Socials.Social) {
          friendPropic = data.Socials.Social[0].profileImage;
        } else if (error) {
          console.log("error:", error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  console.log("friendName:", friendName);
  console.log("friendPropic:", friendPropic);

  // Get current date to show on the image
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();

  console.log("Trying to calculare svg...");

  // Generate the image with Satori
  const svg = await satori(
    <div style={{ ...style.background, backgroundColor: "#7e5bc0" }}>
      <span tw={style.mainText}>
        {friendName == callerUsername
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
          <span tw={style.twFriendName}>{friendName ? friendName : "Not found..."}</span>
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

  console.log("Calculated SVG");

  const outputPath = join(process.cwd(), "public/frames/test.png");
  const sharpBuffer = sharp(Buffer.from(svg)).toFormat("png");

  // Save the image to the file system if we are running locally
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")) {
    await sharpBuffer.toFile(outputPath);
  }

  console.log("Returning image...");
  return await sharpBuffer.toBuffer();
}
