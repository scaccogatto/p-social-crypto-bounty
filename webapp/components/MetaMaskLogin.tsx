import Moralis from 'moralis/types'
import Image from 'next/image'
import { useContext, useEffect } from 'react'
import { authenticate, init, MoralisContext } from '../providers/MoralisContext'

export default function MetaMaskLogin({
  automaticLogin = false,
  onLogin,
  onError,
}: {
  automaticLogin?: boolean
  onLogin?: (user: Moralis.User) => void
  onError?: (error: string) => void
}) {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  useEffect(() => {
    if (!automaticLogin) return
    if (!moralis.connected) return
    if (moralis.authenticating) return
    if (moralis.user) return
    if (moralis.errors.length > 0) return

    authenticate(moralis, dispatch)
  }, [
    dispatch,
    moralis,
    automaticLogin,
    moralis.connected,
    moralis.authenticating,
    moralis.error,
  ])

  useEffect(() => {
    if (!moralis.user) return
    if (moralis.errors.length > 0) return

    onLogin(moralis.user)
  }, [moralis.errors.length, onLogin, moralis.user, moralis.error])

  useEffect(() => {
    if (moralis.errors.length <= 0) return

    onError(moralis.errors[moralis.errors.length - 1])
  }, [onError, moralis.errors])

  return (
    <div>
      <img
        src="/mm-logo.svg"
        alt="metamask logo"
        className="max-w-prose w-full bg-cyan-800 p-4"
      />

      <p className="text-sm text-center">
        If you don&lsquo;t have Metamask installed, please install it{' '}
        <a
          href="https://metamask.io/"
          target="_blank"
          className="text-main"
          rel="noreferrer"
        >
          here
        </a>
      </p>

      {moralis.connected ? (
        <a
          className={`font-bold cursor-pointer ${
            moralis.authenticating ? 'opacity-20' : ''
          }`}
          onClick={() => authenticate(moralis, dispatch)}
        >
          {'>'} Login with Metamask
        </a>
      ) : null}

      {moralis.errors.length > 0 ? (
        <p className="text-red-600">An error has occoured, please try again</p>
      ) : null}
    </div>
  )
}
