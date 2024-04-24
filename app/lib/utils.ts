import { FrameActionDataParsedAndHubContext, getFrameMessage } from "frames.js";
import { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BFF_ADDRESS, SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION } from "./constants/constants";
import { baseSepolia } from "viem/chains";
import { NFTStorage, File } from "nft.storage";
import { init, fetchQuery } from "@airstack/node";
import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
import axios from "axios";
import fs from "fs";
// @ts-ignore
import Hash from "ipfs-only-hash";
import { Readable } from "stream";

init(process.env.AIRSTACK_KEY!);

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

export async function approve(uri: string, minter: Address, friend: Address) {
  const voucher = { uri, minter, friend };
  const chainId = baseSepolia.id;

  const types = {
    Voucher: [
      { name: "uri", type: "string" },
      { name: "minter", type: "address" },
      { name: "friend", type: "address" },
    ],
  };

  const domain = {
    name: SIGNING_DOMAIN_NAME,
    version: SIGNING_DOMAIN_VERSION,
    chainId: chainId,
    verifyingContract: BFF_ADDRESS as Address, // The contract address deployed on Base Sepolia
  };

  try {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY! as Address);
    const signature = account.signTypedData({ domain, types, primaryType: "Voucher", message: voucher });

    return signature;
  } catch (err) {
    console.log(err);
  }
}

export async function validateMessage(
  body: any
): Promise<{ frameMessage: FrameActionDataParsedAndHubContext | undefined; isValid: boolean }> {
  // Getting the frame message
  const frameMessage = await getFrameMessage(
    { trustedData: body.trustedData, untrustedData: body.untrustedData },
    {
      hubHttpUrl: process.env.NEYNAR_HUB_URL!,
      hubRequestOptions: {
        headers: {
          api_key: process.env.NEYNAR_API_KEY!,
        },
      },
    }
  );

  // If the base url is not set or is not localhost, we need to validate the frame message
  if (!process.env.NEXT_PUBLIC_BASE_URL!.includes("localhost") && (!frameMessage || !frameMessage.isValid)) {
    return { frameMessage: undefined, isValid: false };
  }
  return { frameMessage: frameMessage, isValid: true };
}

export async function getFriend(
  callerUsername: string
): Promise<{ friendUsername: string; friendPropic: string; friendAddress: string; friendshipLevel: string }> {
  let friendUsername = "";
  let friendPropic = "";
  let friendAddress = "";
  let friendshipLevel = "";

  // Get friend's name and propic through API calls
  if (callerUsername) {
    try {
      const response = await axios.post("https://graph.cast.k3l.io/links/engagement/handles?limit=1", [callerUsername]);
      console.log("response:", response.data.result);
      if (response.data.result[0]) {
        const element = response.data.result[0];
        friendUsername = element.fname.toString();
        friendAddress = element.address;
        friendshipLevel = element.score;
        const { data, error } = await fetchQuery(query, { fname: friendUsername });
        if (data.Socials.Social) {
          console.log("data:", data.Socials.Social[0]);
          friendPropic = data.Socials.Social[0].profileImage;
        } else if (error) {
          console.log("error:", error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return { friendUsername, friendPropic, friendAddress, friendshipLevel };
}

export async function nftStorageStoreAsset() {
  const API_KEY = process.env.NFT_STORAGE_API_KEY!;

  console.log("API_KEY:", API_KEY);

  try {
    var client = new NFTStorage({ token: API_KEY });
  } catch (err: any) {
    console.log("Failed to create NFTStorage client with error: ", err.message);
    return;
  }

  try {
    const metadata = await client.store({
      name: "TEST NFT",
      description: "My TEST NFT!",
      image: new File([await fs.promises.readFile("public/frames/test.png")], "test.png", { type: "image/png" }),
    });
    console.log("Metadata stored on Filecoin and IPFS with URL:", metadata.url);
  } catch (err: any) {
    console.log("Failed to store metadata with error: ", err.message);
    return;
  }
}

export async function calculateCID(
  imageBuffer: Buffer,
  friendUsername: string,
  callerUsername: string,
  friendshipLevel: string
): Promise<{ imageCid: string; jsonCid: string }> {
  const imageCid = await Hash.of(imageBuffer);

  const json = {
    description:
      friendUsername == callerUsername
        ? `As strange as it may seem, it looks like that ${callerUsername}'s best friend is himself/herself`
        : `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
    image: imageCid,
    name: `${callerUsername} x ${friendUsername}`,
    attributes: {
      trait_type: "Friendship level",
      value: parseInt(friendshipLevel),
    },
  };

  const jsonCid = await Hash.of(Buffer.from(JSON.stringify(json)));
  return { imageCid, jsonCid };
}

export async function pinOnPinata(
  imageBuffer: Buffer,
  friendUsername: string,
  callerUsername: string,
  friendshipLevel: string
): Promise<{ imageResponse: PinataPinResponse; jsonResponse: PinataPinResponse }> {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
  });

  const stream = new Readable();
  stream.push(imageBuffer);
  stream.push(null);
  const imageResponse = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: {
      name: `${callerUsername} x ${friendUsername} image`,
    },
  });

  const json = {
    description:
      friendUsername == callerUsername
        ? `As strange as it may seem, it looks like that ${callerUsername}'s best friend is himself/herself`
        : `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
    image: imageResponse.IpfsHash,
    name: `${callerUsername} x ${friendUsername}`,
    attributes: {
      trait_type: "Friendship level",
      value: parseInt(friendshipLevel),
    },
  };

  const jsonResponse = await pinata.pinJSONToIPFS(json, {
    pinataMetadata: {
      name: `${callerUsername} x ${friendUsername} json`,
    },
  });

  return { imageResponse, jsonResponse };
}
