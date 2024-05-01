// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

struct Voucher {
        string uri;
        address minter;
        address friend;
        bytes signature;
    }

contract FarcasterBestFriends is ERC721, ERC721URIStorage, EIP712 {
    uint256 public currentTokenId;
    
    string private constant SIGNING_DOMAIN = "Farcaster-Best-Friends";
    string private constant SIGNATURE_VERSION = "1";
    address public serverOwner;

    constructor() ERC721("Farcaster Best Friends", "BFF") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        serverOwner = msg.sender;
    }

    function safeMint(Voucher calldata voucher)
        public
        payable
    {  
        address recoveredAddress = _recover(voucher);
        require(serverOwner == recoveredAddress, "Wrong signature.");
        require(msg.sender == voucher.minter, "This NFT is not assigned for you");
        _safeMint(voucher.minter, currentTokenId);
        _setTokenURI(currentTokenId, voucher.uri);
        currentTokenId++;
        if (voucher.friend != address(0)){
            _safeMint(voucher.friend, currentTokenId);
            _setTokenURI(currentTokenId, voucher.uri);
            currentTokenId++;
        }
    }

    function _recover(Voucher calldata voucher) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Voucher(string uri,address minter,address friend)"),
            keccak256(bytes(voucher.uri)),
            voucher.minter,
            voucher.friend
        )));
        address signer = ECDSA.recover(digest, voucher.signature);
        return signer;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}