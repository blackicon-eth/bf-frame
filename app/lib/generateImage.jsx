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
  try {
    const response = await axios.post("https://graph.cast.k3l.io/links/engagement/handles?limit=2", [callerUsername]);
    const promises = response.data.result.map(async (element) => {
      if (element.fname !== callerUsername) {
        const name = element.fname;
        const { data, error } = await fetchQuery(query, { fname: name });
        if (data.Socials.Social) {
          friendPropic = data.Socials.Social[0].profileImageContentValue.image.small;
        } else if (error) {
          console.log("error:", error);
        }
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }

  const svg = await satori(
    <div style={{ ...style.background, backgroundColor: "#7e5bc0" }}>
      <div style={style.friendContainer}>
        <img src={callerPropic} style={style.imageFriend} />
        <span tw={style.twFriendName}>blackicon.eth</span>
      </div>

      <div style={style.friendContainer}>
        <img src={friendPropic} style={style.imageFriend} />
        <span tw={style.twFriendName}>limone.eth</span>
      </div>
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
  return await sharp(Buffer.from(svg)).toFormat("png").toBuffer();
}
