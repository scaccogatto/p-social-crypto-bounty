import { ethers } from "ethers";

const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "bountyUrl",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bountyAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "bountyCreator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "expirationDate",
                "type": "uint256"
            }
        ],
        "name": "BountyCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "bountyUrl",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bountyAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "bountyCreator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "expirationDate",
                "type": "uint256"
            }
        ],
        "name": "BountyRedeemed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "_invalidateContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "bountyUrl",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "expirationDate",
                "type": "uint256"
            }
        ],
        "name": "addBounty",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "bounties",
        "outputs": [
            {
                "internalType": "string",
                "name": "bountyUrl",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "bountyAmount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "bountyCreator",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "expirationDate",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_bountyUrl",
                "type": "string"
            }
        ],
        "name": "bountyCreatorRedeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_bountyUrl",
                "type": "string"
            }
        ],
        "name": "bountyRedeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_bountyUrl",
                "type": "string"
            }
        ],
        "name": "getBounty",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "bountyAmount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "bountyCreator",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "expirationDate",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "bountyUrl",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const SCRedeemBounty = async (_bountyUrl: string, logger?: any) => {
    logger.info('SCRedeemBounty');
    const provider = new ethers.providers.JsonRpcProvider({
        // url: 'https://api.avax-test.network/ext/bc/C/rpc',
        url: 'https://speedy-nodes-nyc.moralis.io/38f9d057c816a75abe6f0416/avalanche/testnet',
    });
    await provider.ready;
    logger.info('Provider ready!');
    const wallet = new ethers.Wallet(process.env.AVALANCHE_TEST_PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(process.env.AVALANCHE_CONTRACT_ADDRESS!, abi, provider);
    const contractWithSigner = contract.connect(wallet);
    logger.info('Contract connected!');
    // This is because of infinite provider.ready pending, so unfortunately
    // we had to mock a return transaction (with a valid transaction done on SC)
    // with another wallet for the demo. We also tried to use avax RPC url,
    // infinite gas limit, other networks, etc. The contract is working, but 
    // calling the contract from Cloud Functions is not working in any kind.
    // We have some ideas in order to fix it, but we won't do it until the hackaton
    // ends.
    const options = { gasPrice: 1000000000000000, gasLimit: 1000000000000000 };
    const tx = await contractWithSigner.bountyRedeem(_bountyUrl, options);
    logger.info('Method called!');
    return tx.hash;
}