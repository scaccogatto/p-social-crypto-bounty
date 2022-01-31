# Behaviors
The contract should call the oracle in order to get issueUrl->callingWalletAddress matching.

If the oracle says "that's ok", then it should resolve itself transferring the money it holds into the caller account.

If not, nothing happens.

If the expiration date is passed, onlyContractOwner and bountyOwner can call a method that resolve the contract transferring the money it holds into the creatorAddress account.

So, for every bounty created a smart contract will be deployed to the blockchain containing:
    the amount of eth, (real one)
    the creator account,
    the bounty creator,
    the expiration date,
    the issueUrl

# Oracle contract
The oracle contract has two input parameters:
    issueUrl
    requestedWalletAddress
it forwards the request to our API and get backs to callerWallet.