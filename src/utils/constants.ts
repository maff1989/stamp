
import { ElectrumTransport } from 'electrum-cash'

// Electrum constants
export const electrumServers = [
  // Our mainnet server, we need to setup a testnet server as well.
  {
    url: 'fulcrum.cashweb.io',
    port: 443,
    scheme: ElectrumTransport.WSS.Scheme
  }
]

// The separation here is due the fork. Not all backends support the new network prefixes yet
// So we are using the legacy prefixes everywhere for API calls, but using
// the ecash prefix for display
export const networkName = 'cash-livenet'
export const displayNetwork = 'livenet'

export const electrumPingInterval = 10_000

// Wallet constants
export const numAddresses = 10
export const numChangeAddresses = 10
export const recomendedBalance = 500_000
export const nUtxoGoal = 10
export const feeUpdateTimerMilliseconds = 60_000
export const defaultFeePerByte = 2

// Keyserver constants
export const keyservers = ['https://mainnet-keyserver.cashweb.io']

// Relay constants
export const pingTimeout = 20_000
export const relayReconnectInterval = 10_000
export const defaultAcceptancePrice = 100
export const defaultRelayUrl = 'https://mainnet-relay.cashweb.io'
export const relayUrlOptions = ['https://mainnet-relay.cashweb.io']
export const defaultRelayData: {
  profile: {
    name: string,
    bio: string,
    avatar: string,
    pubKey?: Uint8Array,
  },
  inbox: {
    acceptancePrice?: number;
  },
  notify: boolean
} = {
  profile: {
    name: '',
    bio: '',
    avatar: ''
  },
  inbox: {
    acceptancePrice: defaultAcceptancePrice
  },
  notify: true
}
export const pendingRelayData = {
  profile: {
    name: 'Loading...',
    bio: '',
    avatar: null,
    pubKey: null
  },
  inbox: {
    acceptancePrice: NaN
  },
  notify: true
}

// Avatar constants
export const defaultAvatars = ['bunny_cyborg.png', 'croc_music.png', 'kitty_standard.png', 'panda_ninja.png', 'dog_posh.png']

// Chat constants
export const defaultStampAmount = 500000
export const stampLowerLimit = 5000

export const defaultContacts = [
  {
    name: 'Give Lotus Chat',
    address: 'lotus_16PSJJK5XfnDCV3sdi3BsgDTa1dS4xezFuH6duwbo'
  },
  {
    name: 'Shammah',
    address: 'lotus_16PSJPAVocAM5behRWxqwQnpEVRPJrV4XxbthBhJR'
  }
]

// Notification constants
export const notificationTimeout = 4000

// Contact defaults
export const defaultUpdateInterval = 60 * 10 * 1_000

// Formatting constants
// TODO: Generate this
export const colorSalt = Buffer.from('salt')
