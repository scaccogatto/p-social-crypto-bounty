import Moralis from 'moralis'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import {
  authenticate,
  enableWeb3,
  init,
  MoralisContext,
} from '../providers/MoralisContext'

export default function Transate() {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  useEffect(() => {
    if (!moralis.connected) return
    if (moralis.authenticating) return
    if (moralis.user) return
    if (moralis.errors.length > 0) return

    authenticate(moralis, dispatch)
  }, [
    dispatch,
    moralis.connected,
    moralis.authenticating,
    moralis.error,
  ])

  useEffect(() => {
    if (moralis.web3Enabled) return
    if (!moralis.connected) return
    if (!moralis.user) return

    enableWeb3(moralis, dispatch)
  }, [dispatch, moralis.connected, moralis.user])

  const [apiResponse, setApiResponse] = useState(undefined)
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter()
  const queryBountyId = router.query.bountyId as string

  useEffect(() => {
    if (apiResponse) return
    if (!moralis.connected) return
    if (!moralis.user) return
    if (!moralis.web3Enabled) return
    if (!queryBountyId) return

    setIsLoading(true);
    Moralis.Cloud.run('redeemBounty', {
      bountyId: queryBountyId,
    })
      .then(({ data }) => {
        setApiResponse(data);
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [apiResponse, setApiResponse, moralis.web3Enabled, queryBountyId, moralis.connected, moralis.user])

  if (isLoading) {
    return <h1 className="h-screen flex flex-col justify-center items-left align-center p-4">
      Loading...
    </h1>
  }

  if (typeof apiResponse === 'undefined') {
    return <h1 className="h-screen flex flex-col justify-center items-left align-center p-4">
      You can collect the bounty, continue with Metamask
    </h1>
  }

  if (apiResponse?.canRedeem) {
    return <h1 className="h-screen flex flex-col justify-center items-left align-center p-4 break-all">
      The bounty redemption process has started, transaction hash:
      <a href={'https://testnet.snowtrace.io/tx/' + apiResponse?.transactionId} target="_blank" rel="noreferrer">
        {apiResponse?.transactionId}
      </a>
      <br />
      <Link href="/search">Back to search</Link>
    </h1>
  }

  return (
    <h1 className="h-screen flex flex-col justify-center items-left align-center p-4">
      Error in bounty redemption process: {apiResponse} :(
      <Link href="/search">Back to search</Link>
    </h1>
  )
}
