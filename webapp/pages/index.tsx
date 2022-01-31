import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-prose mx-auto p-4">
      <h1>Social Crypto Bounty</h1>

      <p>
        This is an experiment that helps open source community getting paid for
        creating and sharing great code.
      </p>
      <p>
        The project started in January 2022, from Marco Palmisano and Marco
        Boffo, two Solutions Architect by day and hardcore developers by night.
        If you want to know more about us please introduce youself on our{' '}
        <a href="https://discord.gg/5CzPTApzy6" target="_blank" rel="noreferrer">
          Discord channel
        </a>
        .
      </p>
      <p>
        The code itself is based on{' '}
        <a href="https://moralis.io/" target="_blank" rel="noreferrer">
          Moralis
        </a>{' '}
        for frontend utilities and backend functionalities, and{' '}
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          Next.js
        </a>{' '}
        for the frontend part. Currently, the smart contract that handles the
        bounties is on AVAX Fuji test network. We used{' '}
        <a href="https://hardhat.org/" target="_blank" rel="noreferrer">
          Hardhat
        </a>{' '}
        as development environment for the smart contract.
      </p>

      <h2>How it works</h2>
      <p>
        A bounty is a simple item that holds AVAX until the linked Github issue
        is redeemed or the bounty itself is expired.
      </p>
      <p>
        Generally speaking, everything works on a smart contract that holds
        every bounty. Everyone can send AVAX to the contract creating a new
        bounty. If a bounty asked to be redeemed, the linked issue is checked
        and, if it is solved by the address asking for the bounty, the amount is
        transfered to the solver.
      </p>

      <h3>You want an issue to be resolved</h3>
      <p>
        If you want to fund a specific issue on order to be resolved you can use
        the smart contract we created. The smart contract is activated by you,
        sending any amount, with some metadata. The metadata requested to create
        a bounty is the issue url (currently supports only Github) and the
        expiration date. The amount you send is hold by the contract itself and
        can be redeemed by someone that sends an accepted pull request on the
        repository (actually solving the issue) or by you only when the
        expiration date is past due.
      </p>
      {/* <p>
        In the original idea, two main factors ensure security on this concept:
        [smart contract] and [the oracle]. The smart contract is open source,
        pretty easy to understand and test; the open source community maintains
        the contract and has every reason to maintain it secure. The Oracle is
        open source and based on Moralis backend. The Oracle is called by using{' '}
        <a href="https://chain.link/">Chainlink</a> to get the issue status and
        resolver from Github. The Oracle is then trustable since is pratically
        Github itself.
      </p> */}
      <p>
        We built an{' '}
        <Link href="/submit">
          <a>easy web interface</a>
        </Link>{' '}
        that allows you to interact with the contract and create your bounty.
        There are some fees you need to pay to the blockchain itself (gas fees,
        you probably heard of that), unfortunately no one can skip that.
      </p>

      <h3>You want to earn money contributing to open source projects</h3>
      <p>
        Well, a lot of people tried this path, and a lot of people failed. This
        very project should be a solution or at least should make your life
        easier. There are three requirements in order to claim a bounty: a
        Github account, an Avalanche Address (on{' '}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">
          Metamask
        </a>
        ) and an accepted pull request on a closed issue. Not every issue on
        Github has a bounty so we build a{' '}
        <Link href="/search">
          <a>list page</a>
        </Link>
        , useful if you want to start somewhere.
      </p>
      <p>
        Claiming a bounty should be an easy task and it is done by interacting
        with our smart contract. The smart contract holds every created bounty
        with some metadata such as the value (AVAX), the issue url and the
        expiration date. If you can solve the linked issue with a valid pull
        request before the expiration date, then you can collect the bounty.
      </p>

      <p>You can collect the bounty by yourself, simply calling the redeem method on the smart contract or using the <Link href="/search">
          <a>web interface we build</a>
        </Link>. An API will be called and check if you are the actual developer that solved the issue, then transfer the bounty balance to your wallet.</p>

      <div className="h-12"></div>

          <h2>Fund projects</h2>

          <p>
            Giving a bounty could speed you an issue resolution and attract new developers. Everything that is open source on Github is a good candidate to be funded.
          </p>

          <Link href="/submit">
            <a className="font-bold mb-12 block">
              {'>'} I want to fund an open source project
            </a>
          </Link>

          <h2>Get paid for great code</h2>

          <p>
            Writing code for open source project is great, time to get paid for it. This should boost the open source community and your productivity.
          </p>

          <Link href="/search">
            <a className="font-bold mb-12 block">
              {'>'} I want earn crypto solving issues
            </a>
          </Link>
      </div>
  )
}
