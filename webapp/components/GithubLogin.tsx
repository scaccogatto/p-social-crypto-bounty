import Moralis from 'moralis'
import { useCallback, useContext, useEffect, useState } from 'react'
import { init, MoralisContext } from '../providers/MoralisContext'

export default function GithubLogin({
  onLogin,
  onError,
}: {
  onLogin: () => void
  onError: (error: string) => void
}) {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (!moralis.connected) return

    setLoading(true)
    Moralis.Cloud.run('isUserRegisteredWithGH')
      .then(({ data }) => {
        setLoggedIn(data)
      })
      .catch(onError)
      .finally(() => setLoading(false))
  }, [onError, moralis.connected])

  const checkLogin = useCallback(() => {
    if (!moralis.connected) return

    setLoading(true)
    Moralis.Cloud.run('isUserRegisteredWithGH')
      .then(({ data }) => {
        console.log(data)
        setLoggedIn(data)
      })
      .catch(onError)
      .finally(() => setLoading(false))
  }, [moralis.connected, setLoading, setLoggedIn, onError])

  useEffect(() => {
    if (!moralis.connected) return
    if (typeof window === 'undefined') return
    window.addEventListener('focus', checkLogin)
    return () => window.removeEventListener('focus', checkLogin)
  }, [checkLogin, moralis.connected])

  useEffect(() => {
    if (!loggedIn) return
    onLogin()
  }, [onLogin, loggedIn])

  // const generateState = async () => {
  //   const { state } = Moralis.Cloud.run('githubGenerateState')
  //   return state
  // }
  const generateState = () => (Math.random() + 1).toString(36).substring(2)

  const startLoginFlow = async () => {
    const state = await generateState()
    localStorage.setItem('gh-pending-state', state)
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&state=${state}`,
      '_blank'
    )
  }

  if (loading) {
    return <div className="text-4xl p-4 text-center">Loading..</div>
  }

  return (
    <div>
      <button className="underline font-bold" onClick={startLoginFlow}>
        {'>'} Login with Github Account
      </button>
    </div>
  )
}
