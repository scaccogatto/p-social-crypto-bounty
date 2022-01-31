import Moralis from 'moralis/node'
import Link from 'next/link'

export default function Bounty({
  id,
  issueUrl,
  expiration,
  description,
  prizeInAvax,
}: {
  id: string
  issueUrl: string
  expiration: Date
  description: string | undefined
  prizeInAvax: number
}) {
  const expired = new Date(expiration).getTime() <= Date.now()

  return (
    <div className="max-w-prose mx-auto p-4">
      {expired ? (
        <h1>The developer who solved this bounty got {prizeInAvax} AVAX</h1>
      ) : (
        <h1>Solving this bounty gives you {prizeInAvax} AVAX</h1>
      )}

      <p>
        This page is a full description for the bounty identified by [id: {id}].
        If you don&lsquo;t know what a bounty is we suggest to{' '}
        <Link href="/">
          <a>take a look to he project&lsquo;s homepage</a>
        </Link>
        . The point is simple: solve an issue with an open source project and
        get paid in AVAX for it.
      </p>

      <h2>How to claim the bounty</h2>
      <p>
        You can claim a {prizeInAvax} AVAX bounty if you solve{' '}
        <a href={issueUrl}>this issue</a> before{' '}
        {new Date(expiration).toLocaleString()}. Also, you need to login with
        your Github account and Metamask. In order to make the issue solved and
        the bounty redeemable, the issue must be closed and you should be the
        author of the pull request that actually solved the issue. A trusted
        API will check the status and transfer the bounty value if everything
        is fine.
      </p>

      <h2>Bounty details</h2>
      <ul>
        <li>
          issue: <a href={issueUrl}>{issueUrl}</a>
        </li>
        {description ? <li>description: {description}</li> : null}
        <li>
          contract:{' '}
          <a href={`https://testnet.snowtrace.io/address/${process.env.CONTRACT_ADDRESS}`}>
            {process.env.CONTRACT_ADDRESS}
          </a>
        </li>
        <li className={`${expired ? 'text-main' : ''}`}>
          expires: {new Date(expiration).toLocaleString()}{' '}
          {expired ? '(EXPIRED)' : null}
        </li>
        <li>prize: {prizeInAvax} AVAX</li>
      </ul>

      <div className="h-12"></div>

      <Link href={`/redeem?bountyId=${id}`}>
        <a className="font-bold block">{'>'} Claim the bounty</a>
      </Link>
      <Link href={`/search`}>
        <a className="font-bold block">{'>'} Show me more bounties</a>
      </Link>
    </div>
  )
}

export const getStaticProps = async ({ params }) => {
  const { id } = params

  const serverUrl = process.env.MORALIS_SERVER_URL
  const appId = process.env.MORALIS_APP_ID
  await Moralis.start({ serverUrl, appId })

  const { data } = await Moralis.Cloud.run('getBounty', { bountyId: id })

  return {
    props: {
      id,
      issueUrl: data.get('issueUrl'),
      owner: data.get('owner'),
      expiration: data.get('expiration'),
      description: data.get('description') || null,
      prizeInAvax: data.get('prizeInAvax'),
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const serverUrl = process.env.MORALIS_SERVER_URL
  const appId = process.env.MORALIS_APP_ID
  await Moralis.start({ serverUrl, appId })

  const { data } = await Moralis.Cloud.run('getBounties')

  return {
    paths: data
      .map((bounty: any) => bounty.id)
      .map((id: string) => `/bounties/${id}`),
    fallback: true,
  }
}
