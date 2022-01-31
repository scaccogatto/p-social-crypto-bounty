# [Social Crypto Bounty](https://social-crypto-bounty.vercel.app/)

This is an experiment that helps open source community getting paid for creating and sharing great code.

The project started in January 2022, from Marco Palmisano and Marco Boffo, two Solutions Architect by day and hardcore developers by night. If you want to know more about us please introduce youself on our Discord channel.

The code itself is based on Moralis for frontend utilities and backend functionalities, and Next.js for the frontend part. Currently, the smart contract that handles the bounties is on AVAX Fuji test network. We used Hardhat as development environment for the smart contract.

## How it works
A bounty is a simple item that holds AVAX until the linked Github issue is redeemed or the bounty itself is expired.

Generally speaking, everything works on a smart contract that holds every bounty. Everyone can send AVAX to the contract creating a new bounty. If a bounty asked to be redeemed, the linked issue is checked and, if it is solved by the address asking for the bounty, the amount is transfered to the solver.

## You want an issue to be resolved
If you want to fund a specific issue on order to be resolved you can use the smart contract we created. The smart contract is activated by you, sending any amount, with some metadata. The metadata requested to create a bounty is the issue url (currently supports only Github) and the expiration date. The amount you send is hold by the contract itself and can be redeemed by someone that sends an accepted pull request on the repository (actually solving the issue) or by you only when the expiration date is past due.

We built an easy web interface that allows you to interact with the contract and create your bounty. There are some fees you need to pay to the blockchain itself (gas fees, you probably heard of that), unfortunately no one can skip that.

## You want to earn money contributing to open source projects
Well, a lot of people tried this path, and a lot of people failed. This very project should be a solution or at least should make your life easier. There are three requirements in order to claim a bounty: a Github account, an Avalanche Address (on Metamask) and an accepted pull request on a closed issue. Not every issue on Github has a bounty so we build a list page, useful if you want to start somewhere.

Claiming a bounty should be an easy task and it is done by interacting with our smart contract. The smart contract holds every created bounty with some metadata such as the value (AVAX), the issue url and the expiration date. If you can solve the linked issue with a valid pull request before the expiration date, then you can collect the bounty.

You can collect the bounty by yourself, simply calling the redeem method on the smart contract or using the web interface we build. An API will be called and check if you are the actual developer that solved the issue, then transfer the bounty balance to your wallet.

