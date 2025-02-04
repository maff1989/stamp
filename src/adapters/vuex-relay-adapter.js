import { RelayClient } from '../cashweb/relay'
import { defaultRelayUrl, networkName } from '../utils/constants'
import { store as levelDbStore } from '../adapters/level-message-store'
import { toRaw, reactive } from 'vue'

export async function getRelayClient ({ wallet, electrumClient, store, relayUrl = defaultRelayUrl }) {
  const observables = reactive({ connected: false })
  const client = new RelayClient(relayUrl, wallet, electrumClient, {
    getPubKey: (address) => {
      const destPubKey = store.getters['contacts/getPubKey'](address)
      return destPubKey
    },
    networkName,
    messageStore: await levelDbStore
  })
  client.events.on('disconnected', () => {
    observables.connected = false
  })
  client.events.on('error', (err) => {
    console.log(err)
  })
  client.events.on('opened', () => { observables.connected = true })
  client.events.on('messageSending', ({ address, senderAddress, index, items, outpoints, transactions, previousHash }) => {
    store.commit('chats/sendMessageLocal', { address, senderAddress, index, items, outpoints: toRaw(outpoints), transactions, previousHash })
  })
  client.events.on('messageSendError', ({ address, senderAddress, index, items, outpoints, transactions, previousHash }) => {
    store.commit('chats/sendMessageLocal', { address, senderAddress, index, items, outpoints: toRaw(outpoints), transactions, previousHash, status: 'error' })
  })
  client.events.on('messageSent', ({ address, senderAddress, index, items, outpoints, transactions, previousHash }) => {
    store.commit('chats/sendMessageLocal', { address, senderAddress, index, items, outpoints: toRaw(outpoints), transactions, previousHash, status: 'confirmed' })
  })
  client.events.on('receivedMessage', (args) => {
    store.dispatch('chats/receiveMessage', args)
  })

  return { client, observables }
}
