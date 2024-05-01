# Farcaster Best Friend Frame

A Farcaster frame that lets you find the person you engaged the most on the platform and mint an NFT representing your friendship.
You can mint the NFT for yourself only or for your friend too!

## Tech used

- This frame leverages Karma3Labs APIs to retrieve the person you engaged the most on Farcaster.
- Airstack was used to get the friend's data and allow the server to create the picture.
- Pinata's pinning service is used to pin the NFT's metadata on IPFS.
- EIP712 is the standard used in the contract. It allows the minting function to be called only against a valid signature created by the server. This way the user can mint whatever picture the server produces but nobody can call the minting function from the outside.
  Using it was a way for me to tinker and get experience with it.

## Good to know while using it

1. Sometimes the frame goes in timeout because API endpoints take a while to answer. If at first it doesn't work, simply click the button again.
2. To send the minting transaction, be sure to use the **_first_** verified Ethereum address you have connected to your Farcaster Account. If you never connected one, use the default address associated with your Account.
3. If the transaction simulator shows it will revert, try changing your connected address as explained above.
4. If no image is shown after the transaction, don't worry, the frame probably encountered a timeout, but the transaction went through and your NFT's metadata will be pinned.
