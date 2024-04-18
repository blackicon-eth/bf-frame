import { FrameValidationData } from "@coinbase/onchainkit";
import { FrameActionDataParsedAndHubContext, getFrameMessage } from "frames.js";
import { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BFF_ADDRESS, SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION } from "./constants/constants";
import { baseSepolia } from "viem/chains";
import axios from "axios";
import { init, fetchQuery } from "@airstack/node";

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
): Promise<{ friendUsername: string; friendPropic: string; friendAddress: string }> {
  let friendUsername = "";
  let friendPropic = "";
  let friendAddress = "";

  // Get friend's name and propic through API calls
  if (callerUsername && false) {
    try {
      const response = await axios.post("https://graph.cast.k3l.io/links/engagement/handles?limit=1", [callerUsername]);
      console.log("response:", response.data.result);
      if (response.data.result[0]) {
        const element = response.data.result[0];
        friendUsername = element.fname.toString();
        friendAddress = element.address;
        const { data, error } = await fetchQuery(query, { fname: friendUsername });
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
  return { friendUsername, friendPropic, friendAddress };
}
