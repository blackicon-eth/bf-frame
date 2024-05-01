import { FrameActionDataParsedAndHubContext, getFrameMessage } from "frames.js";
import { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BFF_ADDRESS, SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION } from "./constants/constants";
import { base } from "viem/chains";
import { init, fetchQuery } from "@airstack/node";
import pinataSDK, { PinataPin, PinataPinResponse } from "@pinata/sdk";
import axios from "axios";
// @ts-ignore
import Hash from "ipfs-only-hash";
import { Readable } from "stream";

init(process.env.AIRSTACK_KEY!);

const getUserInfoQuery = `query GetUserInfo($fid: String) {
  Socials(
    input: {filter: {userId: {_eq: $fid}, dappName: {_eq: farcaster}}, blockchain: ethereum}
  ) {
    Social {
      profileImage
      connectedAddresses {
        address
      }
    }
  }
}`;

export async function approve(uri: string, minter: Address, friend: Address) {
  const voucher = { uri, minter, friend };
  const chainId = base.id;

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
  callerFid: number
): Promise<{ friendUsername: string; friendPropic: string; friendAddress: string; friendshipLevel: string }> {
  let friendUsername = "";
  let friendPropic = "";
  let friendAddress = "";
  let friendshipLevel = "";

  // Get friend's name and propic through API calls
  if (callerFid) {
    try {
      const response = await axios.post("https://graph.cast.k3l.io/links/engagement/fids?limit=25", [callerFid]);
      //console.log("\n K3L Response:\n", response.data.result, "\n");
      for (
        let i = 0;
        i < response.data.result.length && (!friendUsername || !friendPropic || !friendAddress || !friendshipLevel);
        i++
      ) {
        const friend = response.data.result[i];
        if (friend.fid && friend.fid != callerFid && friend.fname && friend.address && friend.score) {
          friendUsername = friend.fname;
          friendshipLevel = friend.score;

          const { data, error } = await fetchQuery(getUserInfoQuery, { fid: friend.fid.toString() });

          if (data.Socials.Social) {
            //console.log("\nAirstack Response:\n", data.Socials.Social[0], "\n");
            friendPropic = data.Socials.Social[0].profileImage;
            friendAddress = data.Socials.Social[0].connectedAddresses[0].address ?? friend.address;
          } else if (error) {
            console.log("error:", error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return { friendUsername, friendPropic, friendAddress, friendshipLevel };
}

export async function calculateCID(
  imageBuffer: Buffer,
  friendUsername: string,
  callerUsername: string,
  friendshipLevel: string
): Promise<{ imageCid: string; jsonCid: string }> {
  const imageCid = await Hash.of(imageBuffer);

  const json = {
    description: `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
    image: imageCid,
    name: `${callerUsername} x ${friendUsername}`,
    attributes: {
      "Friendship level": parseInt(friendshipLevel),
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
): Promise<{ imageResponse: PinataPinResponse | null; jsonResponse: PinataPinResponse | null }> {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
  });

  const stream = new Readable();
  stream.push(imageBuffer);
  stream.push(null);

  // setting up variables for retries
  var retries = 0;
  var imageResponse = null;
  var jsonResponse = null;

  // there's a while loop to retry pinning the image and json in case of failure
  // max retries is 5 each
  while (retries < 5 && (!imageResponse || !jsonResponse)) {
    try {
      if (!imageResponse) {
        imageResponse = await pinata.pinFileToIPFS(stream, {
          pinataMetadata: {
            name: `${callerUsername} x ${friendUsername} image`,
          },
        });
        if (retries > 0) retries = 0;
      }

      if (!jsonResponse) {
        const json = {
          description: `This NFT represents ${callerUsername} and ${friendUsername}'s friendship`,
          image: imageResponse.IpfsHash,
          name: `${callerUsername} x ${friendUsername}`,
          attributes: {
            "Friendship level": parseInt(friendshipLevel),
          },
        };

        jsonResponse = await pinata.pinJSONToIPFS(json, {
          pinataMetadata: {
            name: `${callerUsername} x ${friendUsername} json`,
          },
        });
      }
    } catch (error) {
      console.error(`Error pinning something on Pinata on try #${retries}, error:\n`, error);
      retries += 1;
    }
  }

  return { imageResponse, jsonResponse };
}

export async function countPinataPins() {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
  });

  const isPinataPin = (obj: any): obj is PinataPin => {
    return obj && obj.date_unpinned !== undefined;
  };

  var count = 0;
  for await (const item of pinata.getFilesByCount({})) {
    if (isPinataPin(item) && !item.date_unpinned) {
      count += 1;
    }
  }
  return count;
}
