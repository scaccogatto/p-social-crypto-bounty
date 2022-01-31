import {
  createContext,
  DispatchWithoutAction,
  useEffect,
  useReducer,
  useState,
} from 'react'
import Moralis from 'moralis'

const serverUrl = process.env.MORALIS_SERVER_URL
const appId = process.env.MORALIS_APP_ID

type State = {
  connected: boolean
  authenticating: boolean
  user: null | Moralis.User
  errors: string[]
  web3Enabled: boolean
}

const initialState: any = {
  connected: false,
  authenticating: false,
  user: null,
  errors: [],
  web3Enabled: false,
}

export const MoralisContext = createContext<any>(initialState)

const actions = {
  SET_CONNECTED: (
    state: any,
    payload: Moralis.StartOptions = { serverUrl, appId }
  ) => {
    state = Object.assign({}, state, { connected: true })
    return state
  },
  ADD_ERROR: (state: any, payload: string[]) => {
    state = Object.assign({}, state, { errors: state.errors.concat(payload) })
    return state
  },
  START_AUTH: (state: any) => {
    state = Object.assign({}, state, { authenticating: true })
    return state
  },
  END_AUTH: (state: any) => {
    state = Object.assign({}, state, { authenticating: false })
    return state
  },
  SET_USER: (state: any, payload: Moralis.User) => {
    state = Object.assign({}, state, { user: payload })
    return state
  },
  UNSET_USER: (state: any) => {
    state = Object.assign({}, state, { user: null })
    return state
  },
  SET_GIHUB_AUTHENTICATED: (state: any, payload: string) => {
    state = Object.assign({}, state, { githubAuthenticated: payload })
    return state
  },
  SET_WEB3_ENABLED: (state: any) => {
    state = Object.assign({}, state, { web3Enabled: true })
    return state
  },
  SET_WEB3_DISABLED: (state: any) => {
    state = Object.assign({}, state, { web3Enabled: false })
    return state
  }
}

const reducer = (state: any, action: { type: string; payload?: any }) => {
  return actions[action.type](state, action.payload)
}

export const MoralisProvider = ({ children }) => {
  const [moralis, dispatch] = useReducer<any>(reducer, initialState)
  const [providerValue, setProviderValue] = useState<{
    moralis: any
    dispatch: DispatchWithoutAction
  }>({ moralis, dispatch })

  useEffect(() => {
    setProviderValue({ moralis: moralis as any, dispatch })
  }, [moralis])

  return (
    <MoralisContext.Provider value={providerValue}>
      {children}
    </MoralisContext.Provider>
  )
}

export const init = async (
  state: State,
  dispatch: any,
  payload: Moralis.StartOptions = { serverUrl, appId }
) => {
  if (state.connected) return

  try {
    await Moralis.start(payload)
    dispatch({ type: 'SET_CONNECTED' })
    return true
  } catch (e) {
    dispatch({ type: 'ADD_ERRORS', payload: e })
  }

  return false
}

export const authenticate = async (
  state: State,
  dispatch: any,
) => {
  dispatch({ type: 'START_AUTH' })

  try {
    const user = await Moralis.authenticate({
      chainId: +process.env.CHAIN_ID
    })
    dispatch({ type: 'SET_USER', payload: user })
  } catch (e) {
    dispatch({ type: 'ADD_ERROR', payload: e })
  } finally {
    dispatch({ type: 'END_AUTH' })
  }
}

export const logout = async (state: State, dispatch: any) => {
  try {
    await Moralis.User.logOut()
    dispatch({ type: 'UNSET_USER' })
  } catch (e) {
    dispatch({ type: 'ADD_ERROR', payload: e })
  }
}

export const enableWeb3 = async (state: State, dispatch: any) => {
  try {
    await Moralis.enableWeb3({ provider: 'metamask' })
    dispatch({ type: 'SET_WEB3_ENABLED' })
  } catch (e) {
    dispatch({ type: 'SET_WEB3_DISABLED' })
    dispatch({ type: 'ADD_ERROR', payload: e })
  }
}