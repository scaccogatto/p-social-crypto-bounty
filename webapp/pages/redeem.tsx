import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import BountyChecker from '../components/BountyChecker'
import CollectBounty from '../components/CollectBounty'
import GithubLogin from '../components/GithubLogin'
import MetaMaskLogin from '../components/MetaMaskLogin'
import { MoralisContext } from '../providers/MoralisContext'

export default function Redeem() {
  const { moralis } = useContext(MoralisContext)
  const [bountyId, setBountyId] = useState<string | null>(null)
  const [githubLoggedIn, setGithubLoggedIn] = useState<boolean>(false)

  const router = useRouter()
  const queryBountyId = router.query.bountyId as string

  return (
    <div className="max-w-prose mx-auto p-4">
      <h1>Follow the steps to redeem the bounty</h1>

      <ol>
        <li>
          Add the issue&lsquo;s address you solved to check the bounty status
        </li>
        <li>Connect a Metamask Account</li>
        <li>Verify your Github identity</li>
        <li>Collect the bounty</li>
      </ol>

      <div
        className={`relative bg-secondary mb-4 rounded ${
          !bountyId ? '' : 'opacity-40 grayscale pointer-events-none'
        }`}
      >
        <h2>
          1. Add the issue&lsquo;s address you solved to check the bounty status
        </h2>
        <BountyChecker
          queryBounty={queryBountyId}
          onChange={({ id }) => setBountyId(id)}
        />
      </div>

      <div
        className={`relative bg-secondary mb-4 rounded ${
          bountyId && !moralis?.user?.get('ethAddress')
            ? ''
            : 'opacity-40 grayscale pointer-events-none'
        }`}
      >
        <h2>2. Connect a Metamask Account</h2>
        {moralis.connected && moralis.user ? (
          <div>
            <p>
              You successfully connected with Metamask, you are using:{' '}
              <a
                href={`https://testnet.snowtrace.io/address/${moralis.user.get(
                  'ethAddress'
                )}`}
                className="font-bold"
                target="_blank"
                rel="noreferrer"
              >
                {moralis.user.get('ethAddress')}
              </a>{' '}
              as AVAX Address.
            </p>
          </div>
        ) : (
          <div>
            <MetaMaskLogin />
          </div>
        )}
      </div>

      <div
        className={`relative bg-secondary mb-4 rounded ${
          moralis?.user?.get('ethAddress') && !githubLoggedIn
            ? ''
            : 'opacity-40 grayscale pointer-events-none'
        }`}
      >
        <h2>3. Verify your Github identity</h2>
        <GithubLogin
          onLogin={() => {
            setGithubLoggedIn(true)
          }}
          onError={() => {}}
        />
      </div>

      <div
        className={`relative bg-secondary ${
          moralis?.user?.get('ethAddress') && githubLoggedIn && bountyId
            ? ''
            : 'opacity-40 grayscale pointer-events-none'
        }`}
      >
        <h2>4. Collect the bounty</h2>
        <CollectBounty bountyId={bountyId} />
      </div>
    </div>
  )
}
