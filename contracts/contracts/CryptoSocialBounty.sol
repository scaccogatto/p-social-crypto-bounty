// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

// DEV: Comment me when compiling, but use me for Intellisense
// import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
// DEV: uncomment me when compiling, comment for Intellisense
import "@openzeppelin/contracts/access/Ownable.sol";

// Bounty Object info
struct Bounty {
    string bountyUrl;
    uint256 bountyAmount;
    address bountyCreator;
    uint256 expirationDate;
    bool exists;
}

contract CryptoSocialBounty is Ownable {
    event BountyCreated(
        string bountyUrl,
        uint256 bountyAmount,
        address bountyCreator,
        uint256 expirationDate
    );

    event BountyRedeemed(
        string bountyUrl,
        uint256 bountyAmount,
        address bountyCreator,
        uint256 expirationDate
    );

    mapping(string => Bounty) public bounties;

    address private _ownerAddress;
    bool private _isContractInvalidated = false;

    modifier invalidable() {
        require(_isContractInvalidated == false, "Contract is invalidated");
        _;
    }

    constructor() {
        _ownerAddress = msg.sender;
    }

    function addBounty(string calldata bountyUrl, uint256 expirationDate)
        public
        payable
        invalidable
    {
        require(msg.value > 0, "Bounty amount must be greater than 0");
        require(bytes(bountyUrl).length > 0, "Bounty URL must be valid");
        require(expirationDate < 2643464934, "Date must be in Unix Seconds!"); // Magic Date: 7/10/2053
        require(
            expirationDate > block.timestamp,
            "Bounty expiration date must be greater than now!"
        );
        require(bounties[bountyUrl].exists == false, "Bounty already exists");

        // Creating new Bounty struct
        Bounty memory bounty = Bounty({
            bountyUrl: bountyUrl,
            bountyAmount: msg.value,
            bountyCreator: msg.sender,
            expirationDate: expirationDate,
            exists: true
        });

        // Save in storage
        bounties[bountyUrl] = bounty;

        // Emits event
        emit BountyCreated(
            bounty.bountyUrl,
            bounty.bountyAmount,
            bounty.bountyCreator,
            bounty.expirationDate
        );
    }

    // funzione per riscattare il bounty (al creatore)
    function bountyCreatorRedeem(string memory _bountyUrl) public invalidable {
        require(bytes(_bountyUrl).length > 0, "Bounty URL must be valid");

        // If the caller is not the bounty creator, then stop it
        require(
            msg.sender == bounties[_bountyUrl].bountyCreator,
            "Only bounty creator can redeem"
        );

        // If bounty expiration date is not passed, then stop it
        require(
            bounties[_bountyUrl].expirationDate < block.timestamp,
            "Bounty is not expired yet"
        );

        // If the bounty has already been redeemed, then stop it
        require(
            bounties[_bountyUrl].bountyAmount > 0,
            "Bounty is already redeemed"
        );

        // Actual bounty redemption
        payable(bounties[_bountyUrl].bountyCreator).transfer(
            bounties[_bountyUrl].bountyAmount
        );

        // Update bounty struct
        bounties[_bountyUrl].exists = false;
        bounties[_bountyUrl].bountyAmount = 0;

        // Emit the event
        emit BountyRedeemed(
            bounties[_bountyUrl].bountyUrl,
            bounties[_bountyUrl].bountyAmount,
            bounties[_bountyUrl].bountyCreator,
            bounties[_bountyUrl].expirationDate
        );
    }

    // Redeem bounty
    function bountyRedeem(string memory _bountyUrl)
        public
        onlyOwner
        invalidable
    {
        require(!_isContractInvalidated, "Contract is invalidated");
        require(bytes(_bountyUrl).length > 0, "Bounty URL must be valid");
        require(bounties[_bountyUrl].exists == true, "Bounty must exists");

        // If the bounty has already been redeemed, then stop it
        require(
            bounties[_bountyUrl].bountyAmount > 0,
            "Bounty is already redeemed"
        );

        Bounty memory bounty = bounties[_bountyUrl];
        payable(msg.sender).transfer(bounty.bountyAmount);

        // Update bounty struct
        bounties[_bountyUrl].exists = false;
        bounties[_bountyUrl].bountyAmount = 0;

        emit BountyRedeemed(
            bounties[_bountyUrl].bountyUrl,
            bounties[_bountyUrl].bountyAmount,
            bounties[_bountyUrl].bountyCreator,
            bounties[_bountyUrl].expirationDate
        );
    }

    function getBounty(string memory _bountyUrl)
        public
        view
        invalidable
        returns (
            uint256 bountyAmount,
            address bountyCreator,
            uint256 expirationDate,
            string memory bountyUrl
        )
    {
        require(bytes(_bountyUrl).length > 0, "Bounty URL must be valid");
        Bounty memory bounty = bounties[_bountyUrl];

        require(
            keccak256(abi.encode(bounties[_bountyUrl].bountyUrl)) ==
                keccak256(abi.encode(_bountyUrl)),
            "Bounty doesn't exists"
        );

        return (
            bounty.bountyAmount,
            bounty.bountyCreator,
            bounty.expirationDate,
            bounty.bountyUrl
        );
    }

    function _invalidateContract() public onlyOwner invalidable {
        _isContractInvalidated = true;
    }
}
