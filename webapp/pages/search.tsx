import Moralis from 'moralis/node'
import Link from 'next/link'

export default function Search({
  bounties,
}: {
  bounties: {
    id: string
    expiration: string
    prizeInAvax: number
    issueUrl: string
  }[]
}) {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-prose mx-auto">
        <h1>Get a prize in AVAX for resolving a Bounty</h1>
        <p>
          This is a list containing all the active bounties, ordered by bounty
          prize. Before redeeming a bounty you should have an AVAX address (C-Address) and{' '}
          <a href="https://metamask.io/" target="_blank" rel="noreferrer">
            Metamask
          </a>{' '}
          installed.
        </p>
        <p>
          If you landed on this page and want to know more about the project
          before getting paid for contributing to open source projects, please{' '}
          <Link href="/">
            <a>take a look to the home page</a>
          </Link>
          .
        </p>
      </div>

      <div className="mb-12"></div>

      <div className="grid grid-cols-[auto_auto_auto_auto] overflow-y-auto border-2 border-cyan-800">
        <h3 className="p-2 text-left">Repository</h3>
        <h3 className="p-2 text-center">Prize (AVAX)</h3>
        <h3 className="p-2 text-right">Expiration date</h3>
        <div></div>
        {bounties.map((bounty, i) => (
          <>
            <div
              key={bounty.id + 'url'}
              className={`p-2 ${i % 2 === 0 ? 'bg-cyan-900' : ''}`}
            >
              <a href={bounty.issueUrl} target="_blank" rel="noreferrer">
                {
                  bounty.issueUrl
                    .split('https://github.com/')[1]
                    .split('/issues/')[0]
                }
              </a>
            </div>
            <div
              key={bounty.id + 'prize'}
              className={`p-2 text-center ${i % 2 === 0 ? 'bg-cyan-900' : ''}`}
            >
              {bounty.prizeInAvax} AVAX
            </div>
            <div
              key={bounty.id + 'expiration'}
              className={`p-2 text-right ${i % 2 === 0 ? 'bg-cyan-900' : ''}`}
            >
              {new Date(bounty.expiration).toLocaleString()}
            </div>
            <div
              key={bounty.id + 'redeem'}
              className={`p-2 text-center ${i % 2 === 0 ? 'bg-cyan-900' : ''}`}
            >
              <Link href={`/bounties/${bounty.id}`}>
                <a>{'>'} redeem</a>
              </Link>
            </div>
          </>
        ))}
      </div>
    </div>
  )
}

export const getStaticProps = async ({ params }) => {
  const serverUrl = process.env.MORALIS_SERVER_URL
  const appId = process.env.MORALIS_APP_ID
  await Moralis.start({ serverUrl, appId })

  const { data } = await Moralis.Cloud.run('getBounties')

  return {
    props: {
      bounties: data
        .map((bounty: { id: any; get: (arg0: string) => any }) => ({
          id: bounty.id,
          issueUrl: bounty.get('issueUrl'),
          expiration: bounty.get('expiration'),
          prizeInAvax: bounty.get('prizeInAvax') || 0,
        }))
        .filter(
          (bounty: { expiration: string }) =>
            new Date(bounty.expiration) > new Date()
        )
        .sort(
          (a: { prizeInAvax: number }, b: { prizeInAvax: number }) =>
            b.prizeInAvax - a.prizeInAvax
        ),
    },
    revalidate: 60,
  }
}
