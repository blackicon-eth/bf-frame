import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import * as style from "./style_components/styles";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Loading fonts
const gothamBoldItalic = join(process.cwd(), "public/fonts/GothamBoldItalic.ttf");
const gothamBoldItalicData = readFileSync(gothamBoldItalic);

export async function localImageToFrame(event, value) {
  // creating image for calculated bmi
  if (event == "bmi") {
    const imagePath = path.join(process.cwd(), "public/frames/bmi_result.jpg");
    const buffer = fs.readFileSync(imagePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const svg = await satori(
      <body>
        <img src={arrayBuffer} style={style.image} />
        <span style={style.bmiText}>{value}</span>
      </body>,
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

  // creating image for calculated bf
  else if (event == "bf") {
    const imagePath = path.join(process.cwd(), "public/frames/bf_result.jpg");
    const buffer = fs.readFileSync(imagePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const svg = await satori(
      <body>
        <img src={arrayBuffer} style={style.image} />
        <span style={style.bfText}>{value}</span>
      </body>,
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

  // creating image for calories count
  else if (event == "cc") {
    const weightLoss = (parseInt(value) - 500).toString();
    const mildWeightLoss = (parseInt(value) - 250).toString();
    const weightGain = (parseInt(value) + 500).toString();
    const mildWeightGain = (parseInt(value) + 250).toString();

    const imagePath = path.join(process.cwd(), "public/frames/cc_result.jpg");
    const buffer = fs.readFileSync(imagePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const svg = await satori(
      <body>
        <img src={arrayBuffer} style={style.genericImage} />
        <span style={style.ccTextWeightGain}>{weightGain}</span>
        <span style={style.ccTextMildWeightGain}>{mildWeightGain}</span>
        <span style={style.ccTextWeight}>{value}</span>
        <span style={style.ccTextMildWeightLoss}>{mildWeightLoss}</span>
        <span style={style.ccTextWeightLoss}>{weightLoss}</span>
      </body>,
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
}
