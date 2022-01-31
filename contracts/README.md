# Social Crypto Bounty Contracts

## What this repo is

This repo is the official Social Crypto Bounty Contracts subrepository.
It contains all the smart contract files/configurations/dev kit but environment variables values and private keys, you know :)

## Contract address

<!-- AVAX Fuji testnet address: `0x783f277F67158e59FE51aD3E16540a2200c41bb2` -->
AVAX Fuji testnet address: `0x34c96Ec97bDd6471106201c68217B311793bED92`

## Our contract

Our smart contract is pretty simple, you can easily find the source code in `contracts/` folder

It has basically 2 functions that will be used:

- addBounty
- redeemBounty

Unfortunately, due to the fact that AVAX network is as great as young, we weren't able to find any HTTP oracle we could use for bounty reedeming, so contract "redeemBounty" function became callable only by our wallet.

But you don't have to worry, all the backend code that interacts with the smart contract is public as well, and its deployment pipelines too! :)
