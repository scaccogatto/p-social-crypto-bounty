import Moralis from 'moralis'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function BountyChecker({
  queryBounty,
  onChange,
}: {
  queryBounty: string
  onChange: (bounty: any) => void
}) {
  const [issueLink, setIssueLink] = useState<string | undefined>(undefined)
  const [checking, setChecking] = useState<boolean>(false)
  const [bounty, setBounty] = useState<any>()
  const inputEl = useRef(null)

  useEffect(() => {
    if (!queryBounty) return
    if (!inputEl.current) return

    Moralis.Cloud.run('getBounty', {
      bountyId: queryBounty,
    }).then(({ data }) => {
      inputEl.current.value = data.get('issueUrl')
    })
  }, [queryBounty])

  const checkBountyForIssue = async (issueLink: string) => {
    setChecking(true)

    const { data } = await Moralis.Cloud.run('getBountyFromIssueUrl', {
      issueUrl: issueLink,
    })

    setBounty(data)
    setChecking(false)
  }

  useEffect(() => {
    if (!bounty) return
    onChange(bounty)
  }, [bounty, onChange])

  return (
    <div>
      <input
        ref={inputEl}
        type="text"
        placeholder="https://github.com/[entity]/[project]/issues/[issureId]"
        className="p-2 block w-full"
        value={issueLink}
        onChange={(e) => {
          setIssueLink(e.target.value)
        }}
      />
      <button
        className={`cursor-pointer underline font-bold ${
          checking || bounty ? 'opacity-40 grayscale pointer-events-none' : ''
        }`}
        onClick={() => checkBountyForIssue(issueLink || inputEl.current.value)}
      >
        {'>'} Check Bounty
      </button>
    </div>
  )
}
