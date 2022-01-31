import Link from 'next/link'
import { useContext } from 'react'
import MetaMaskLogin from '../components/MetaMaskLogin'
import SubmitForm from '../components/SubmitForm'
import { logout, MoralisContext } from '../providers/MoralisContext'

export default function Submit() {
  const { moralis, dispatch } = useContext(MoralisContext)

  return (
    <div className="max-w-prose mx-auto p-4">
      <h1>Make someone close an issue on a open source project</h1>

      <p>
        This project helps people making valuable investments into open source
        projects. There are a lot of reasons to do so: there is a bug that you
        cannot solve by your own and you need it solved, you are a company that
        uses open source software and want to give something back, you want to
        make a project famous.
      </p>
      <p>
        Everything is secured by using the blockchain (Avalanche) using a
        trustable smart contract, open source. If you landed
        here we suggest to{' '}
        <Link href="/">
          <a>take a look to he project&lsquo;s homepage</a>
        </Link>{' '}
        before creating a bounty.
      </p>

      <div className="h-12"></div>

      <h2>1. Connect your wallet with Metamask</h2>

      {moralis.connected && moralis.user ? (
        <div className="mb-4">
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
            as AVAX Address. If you do not want to proceed with that account you
            can{' '}
            <a
              className="cursor-pointer"
              onClick={() => logout(moralis, dispatch)}
            >
              logout from Metamask
            </a>
            .
          </p>
        </div>
      ) : (
        <MetaMaskLogin onLogin={(user) => {}} onError={(e) => {}} />
      )}

      <h2>2. Create the bounty</h2>

      <SubmitForm />
    </div>
  )
}
