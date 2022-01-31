import Moralis from 'moralis'
import { useContext, useEffect, useState } from 'react'
import { MoralisContext, init } from '../providers/MoralisContext'

export default function GHLogin() {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!moralis.connected) return

    const searchParams = new URLSearchParams(window.location.search)
    const urlCode = searchParams.get('code')
    const urlState = searchParams.get('state')
    if (!urlCode || !urlState) return

    const savedState = localStorage.getItem('gh-pending-state')
    if (urlState !== savedState) {
      setError(true)
      return
    }

    setLoading(true)

    Moralis.Cloud.run('githubLogin', { code: urlCode })
      .then(() => setLoggedIn(true))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [moralis.connected])

  if (loading) {
    return (
      <h1 className="h-screen grid justify-center items-center p-4">Loading..</h1>
    )
  }

  if (error) {
    return (
      <h1 className="h-screen grid justify-center items-center p-4">
        An error has occoured, close the page and try again
      </h1>
    )
  }

  return (
    <h1 className="h-screen grid justify-center items-center p-4">
      Success, you may now close this page
    </h1>
  )
}
