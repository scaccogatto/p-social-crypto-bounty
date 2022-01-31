import { Formik } from 'formik'
import Moralis from 'moralis'
import { useRouter } from 'next/router'
import { useCallback, useContext, useEffect, useState } from 'react'
import { enableWeb3, init, MoralisContext } from '../providers/MoralisContext'

const contract = process.env.CONTRACT_ADDRESS
const contractABI = JSON.parse(
  Buffer.from(process.env.CONTRACT_ABI_B64, 'base64').toString()
)

export default function SubmitForm() {
  const { moralis, dispatch } = useContext(MoralisContext)
  init(moralis, dispatch)

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!moralis.connected) return
    if (!moralis.user) return

    enableWeb3(moralis, dispatch)
      .then(() => console.log('Web3 enabled'))
      .catch(e => console.error('Error in enabling web3', e));
  }, [moralis.user, moralis.connected, moralis.web3Enabled])

  const router = useRouter()

  const onSubmit = useCallback(
    async (
      { issueUrl, prizeInAvax, description, expiration },
      { setSubmitting }
    ) => {
      setSubmitting(true)

      const options = {
        // chain: 'avaxfuji',
        contractAddress: contract,
        functionName: 'addBounty',
        abi: contractABI.abi,
        params: {
          bountyUrl: issueUrl,
          expirationDate: Math.ceil(new Date(expiration).getTime() / 1000),
        },
        msgValue: Moralis.Units.ETH(parseFloat(prizeInAvax)),
      }

      try {
        setError(null);
        const { result: checkResult, data: checkData } = await Moralis.Cloud.run('createBountyCheck', {
          issueUrl,
          description,
          expiration: new Date(expiration).toISOString(),
          prizeInAvax: parseFloat(prizeInAvax),
        })

        if (!checkResult) {
          setError(checkData?.data?.message || checkData?.data || checkData);
          return;
        }

        // @ts-expect-error
        const { hash, wait } = await Moralis.executeFunction(options);
        await wait();

        const { result, data } = await Moralis.Cloud.run('createBounty', {
          transactionId: hash,
          issueUrl,
          description,
          expiration: new Date(expiration).toISOString(),
          prizeInAvax: parseFloat(prizeInAvax),
        })

        if (!result) {
          setError(checkData?.data?.message || checkData?.data || checkData);
        }

        if (!data.id) return

        router.push(`/bounties/${data.id}`)
      } catch (e) {
        if (e?.data?.message) {
          setError(e.data.message);
        }
        console.error(e)
      }

      setSubmitting(false)
    },
    [router]
  )

  const validate = ({ issueUrl, prizeInAvax, description, expiration }) => {
    const errors = {
      issueUrl:
        issueUrl?.includes('github.com') && issueUrl?.includes('issues')
          ? undefined
          : 'Invalid Github address',
      prizeInAvax:
        parseFloat(prizeInAvax) > 0.00032
          ? undefined
          : 'Bounty must be more than 0.00032 AVAX',
      description: undefined,
      expiration:
        new Date(expiration).getTime() > Date.now()
          ? undefined
          : 'Expiration must be in the future',
    }

    return Object.entries(errors).reduce((acc, [key, value]) => {
      return Object.assign({}, acc, value ? { [key]: value } : {})
    }, {})
  }

  if (!moralis.web3Enabled) return null

  return (
    <Formik
      initialValues={{
        issueUrl: undefined,
        prizeInAvax: undefined,
        description: undefined,
        expiration: undefined,
      }}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        isSubmitting,
        values,
        errors,
        touched,
      }) => (
        <>
          {error &&
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <h4>{error}</h4>
            </div>
          }
          <form onSubmit={handleSubmit} className="">
            <label htmlFor="issueUrl" className="text-right">
              The issue address on Github
            </label>
            <div>
              <input
                type="text"
                name="issueUrl"
                value={values.issueUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://github.com/[entity]/[project]/issues/[issureId]"
                className="p-2 block w-full"
              />
              <div className="h-10 text-red-600">
                {errors.issueUrl && touched.issueUrl && errors.issueUrl}
              </div>
            </div>

            <label htmlFor="prizeInAvax" className="text-right">
              Bounty for issue closing (AVAX)
            </label>
            <div>
              <input
                type="text"
                name="prizeInAvax"
                value={values.prizeInAvax}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00032"
                className="p-2 block w-full"
              />

              <div className="h-10 text-red-600">
                {errors.prizeInAvax && touched.prizeInAvax && errors.prizeInAvax}
              </div>
            </div>

            <label htmlFor="description" className="text-right">
              Bounty reason
            </label>
            <div>
              <input
                type="text"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="I need help with this issue"
                className="p-2 block w-full"
              />

              <div className="h-10 text-red-600">
                {errors.description && touched.description && errors.description}
              </div>
            </div>

            <label htmlFor="expiration" className="text-right">
              Expires
            </label>
            <div>
              <input
                type="date"
                name="expiration"
                value={values.expiration}
                onChange={handleChange}
                onBlur={handleBlur}
                className="p-2 block w-full"
              />

              <div className="h-10 text-red-600">
                {errors.expiration && touched.expiration && errors.expiration}
              </div>
            </div>

            <div></div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold underline ${isSubmitting ? 'opacity-50' : ''
                }`}
            >
              {'>'} Create the bounty
            </button>
            <div className="text-sm opacity">
              This will open Metamask and ask for a transaction to the contract [
              {contract}]
            </div>
          </form>
        </>
      )}
    </Formik>

  )
}
