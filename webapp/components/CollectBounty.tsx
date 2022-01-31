import Moralis from 'moralis'
import { useContext, useEffect, useState } from 'react'
import { MoralisContext } from '../providers/MoralisContext'

export default function CollectBounty({ bountyId }) {
  const [issueUrl, setIssueUrl] = useState(undefined)
  const [avax, setAvax] = useState(undefined)
  const [isLoading, setIsLoading] = useState(undefined)
  const [collectible, setCollectible] = useState(false)
  const { moralis, dispatch } = useContext(MoralisContext)

  useEffect(() => {
    if (!bountyId) return

    Moralis.Cloud.run('getBounty', {
      bountyId: bountyId,
    }).then(({ data }) => {
      setIssueUrl(data.get('issueUrl'))
      setAvax(data.get('prizeInAvax'))
    })
  }, [bountyId])

  const redeemBounty = () => {
    setIsLoading(true);
    Moralis.Cloud.run('redeemBounty', {
      bountyId: bountyId,
    }).then(({ data }) => {
      setCollectible(true)
    }).finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (!collectible) return
    if (!bountyId) return
    window.location.href = `/transate?bountyId=${bountyId}`
  }, [bountyId, collectible])

  if (!issueUrl) return null

  return (
    <div>
      <p>The following bounty</p>
      <div>
        <div className="bg-cyan-900 px-8 py-2">
          <ul>
            <li>
              <a href={issueUrl} target="_blank" rel="noreferrer">
                {issueUrl.split('https://github.com/')[1].split('/issues/')[0]}
              </a>
            </li>
            <li>AVAX value: {avax}</li>
          </ul>
        </div>

        <p>
          is going to be transferred to your address [
          {moralis?.user?.get('ethAddress')}]
        </p>
      </div>
      <button disabled={isLoading} className="font-bold underline" onClick={redeemBounty}>
        {'>'} Check if you can collect the bounty
      </button>
    </div>
  )
}
