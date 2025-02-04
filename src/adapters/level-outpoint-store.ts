import { LevelOutpointStore } from '../cashweb/wallet/storage/level-storage'

export async function createStore (): Promise<LevelOutpointStore> {
  const store = new LevelOutpointStore('outpointStorage')
  await store.Open()
  // Path doesn't matter. We're using indexdb
  return store
}

export const store = createStore()
