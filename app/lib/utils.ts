import { FrameValidationData } from "@coinbase/onchainkit";
import { getFrameMessage } from "frames.js";
import { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BFF_ADDRESS, SIGNING_DOMAIN_NAME, SIGNING_DOMAIN_VERSION } from "./constants/constants";
import { baseSepolia } from "viem/chains";

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

export const getFarcasterAccountAddress = (interactor: FrameValidationData["interactor"]) => {
  // Get the first verified account or the custody address
  return interactor.verified_accounts[0] ?? interactor.custody_address;
};

export async function validateMessage(body: any): Promise<any> {
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
    return { FrameMessage: null, isValid: false };
  }
  return { FrameMessage: frameMessage, isValid: true };
}
