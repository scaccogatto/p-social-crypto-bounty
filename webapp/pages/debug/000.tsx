import Moralis from 'moralis'

import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import {
  authenticate,
  enableWeb3,
  init,
  MoralisContext,
} from '../../providers/MoralisContext'

const contract = process.env.CONTRACT_ADDRESS
const contractABI = [
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

const chain = process.env.CHAIN

export default function Transate() {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  useEffect(() => {
    if (!moralis.connected) return
    if (!moralis.user) return

    enableWeb3(moralis, dispatch)
      .then(() => console.log('Web3 enabled'))
      .catch(e => console.error('Error in enabling web3', e));
  }, [moralis.user, moralis.connected, moralis.web3Enabled])

  useEffect(() => {
    if (!moralis.connected) return
    if (moralis.authenticating) return
    if (moralis.user) return
    if (moralis.errors.length > 0) return

    authenticate(moralis, dispatch)
  }, [
    moralis,
    dispatch,
    moralis.connected,
    moralis.authenticating,
    moralis.error,
  ])

  const [ok, setOk] = useState(undefined)

  const router = useRouter()
  const queryBountyId = router.query.bountyId as string

  const [bountyUrl, setBountyUrl] = useState(undefined)

  useEffect(() => {
    if (!queryBountyId) return

    Moralis.Cloud.run('getBounty', {
      bountyId: queryBountyId,
    }).then(({ data }) => {
      setBountyUrl(data.get('issueUrl'))
    })
  }, [queryBountyId, setBountyUrl])

  const a = () => {
    if (!moralis.connected) return
    if (!moralis.user) return
    if (!moralis.web3Enabled) return
    if (!bountyUrl) return

    const options = {
      chain,
      contractAddress: contract,
      functionName: 'bountyRedeem',
      abi: contractABI,
      params: { _bountyUrl: bountyUrl },
    }

    Moralis.executeFunction(options)
      .then(e => {
        console.log(e);
        setOk(true)
      })
      .catch(e => {
        console.log(e);
        setOk(false)
      })
  };

  return (
    <h1 className="text-4xl h-screen flex justify-center items-center align-center p-4" onClick={() => a()}>
      {typeof ok === 'undefined'
        ? 'You can collect the bounty, continue with Metamask'
        : null}
      {ok === true ? 'Bounty collected' : null}
      {ok === false ? 'Error please retry' : null}
    </h1>
  )
}
