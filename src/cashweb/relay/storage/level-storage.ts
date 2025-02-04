/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageStore, MessageResult, MessageReturnResult } from './storage'
import { MessageWrapper } from 'src/cashweb/types/messages'
import level, { LevelDB } from 'level'
import { join } from 'path'

const metadataKeys = {
  schemaVersion: 'schemaVersion',
  lastServerTime: 'lastServerTime'
}

class MessageIterator implements AsyncIterableIterator<MessageWrapper> {
  iterator: any;
  db: LevelDB;

  constructor (db: LevelDB) {
    this.db = db
  }

  async next (): Promise<IteratorResult<MessageWrapper>> {
    const value = await new Promise<void | MessageWrapper>((resolve, reject) => {
      this.iterator.next((error: Error, key: string, value: string) => {
        if (error) {
          reject(error)
        }
        if (!key) {
          this.iterator.end((error: Error) => {
            if (error) {
              reject(error)
            }
            resolve()
          })
          resolve()
          return
        }
        const parsedValue: MessageWrapper = JSON.parse(value)
        resolve(parsedValue)
      })
    })
    if (!value) {
      return new MessageReturnResult()
    }
    return new MessageResult(value)
  }

  async return (): Promise<IteratorResult<MessageWrapper>> {
    return new Promise((resolve, reject) => {
      this.iterator.end((error: Error) => {
        this.db.close()
        if (error) {
          reject(error)
        }
        resolve({ done: true, value: undefined })
      })
    })
  }

  [Symbol.asyncIterator] (): AsyncIterableIterator<MessageWrapper> {
    this.iterator = this.db.iterator({})
    return this
  }
}

const currentSchemaVersion = 1

export class LevelMessageStore implements MessageStore {
  private messageDbLocation: string
  private metadataDbLocation: string
  private schemaVersion?: number
  private openedDb?: LevelDB
  private openedMetadataDb?: LevelDB

  constructor (location: string) {
    this.messageDbLocation = join(location, 'messages')
    this.metadataDbLocation = join(location, 'metadata')
  }

  async Open () {
    this.openedDb = level(this.messageDbLocation)
    this.openedMetadataDb = level(this.metadataDbLocation)

    const dbSchemaVersion = await this.getSchemaVersion()
    if (!dbSchemaVersion) {
      await this.setSchemaVersion(currentSchemaVersion)
    } else if (dbSchemaVersion < currentSchemaVersion) {
      console.warn('Outdated DB, may need migration')
    } else if (dbSchemaVersion > currentSchemaVersion) {
      console.warn('Newer DB found. Client downgraded?')
    }
  }

  async Close () {
    this.db.close()
  }

  get db () {
    if (!this.openedDb) {
      throw new Error('No db opened')
    }
    return this.openedDb
  }

  get metadataDb () {
    if (!this.openedMetadataDb) {
      throw new Error('No db opened')
    }
    return this.openedMetadataDb
  }

  private getMetadataDatabase () {
    return level(this.messageDbLocation)
  }

  async getMessage (payloadDigest: string): Promise<MessageWrapper | undefined> {
    try {
      const value = await this.db.get(payloadDigest)
      return JSON.parse(value)
    } catch (err: any) {
      if (err.type === 'NotFoundError') {
        return
      }
      throw err
    }
  }

  async deleteMessage (payloadDigest: string): Promise<void> {
    await this.db.del(payloadDigest)
  }

  async saveMessage (messageWrapper: MessageWrapper): Promise<void> {
    const index = messageWrapper.index
    await this.mostRecentMessageTime(messageWrapper.message.serverTime)
    await this.db.put(index, JSON.stringify(messageWrapper))
  }

  async mostRecentMessageTime (newLastServerTime?: number): Promise<number> {
    const jsonNewLastServerTime = JSON.stringify(newLastServerTime || 0)
    try {
      const lastServerTimeString: string = await this.db.get(metadataKeys.lastServerTime)
      const lastServerTime = JSON.parse(lastServerTimeString)
      if (!lastServerTime) {
        await this.db.put(metadataKeys.lastServerTime, jsonNewLastServerTime)
      }
      if (!newLastServerTime) {
        return JSON.parse(lastServerTime)
      }
      if (lastServerTime < newLastServerTime) {
        await this.db.put(metadataKeys.lastServerTime, jsonNewLastServerTime)
      }
      return Math.max(newLastServerTime, lastServerTime)
    } catch (err: any) {
      if (err.type === 'NotFoundError') {
        if (newLastServerTime) {
          await this.db.put(metadataKeys.lastServerTime, jsonNewLastServerTime)
          return newLastServerTime
        }
        return 0
      }
      throw err
    }
  }

  private async getSchemaVersion (): Promise<number> {
    if (this.schemaVersion) {
      return this.schemaVersion
    }

    try {
      const value: string = await this.metadataDb.get(metadataKeys.schemaVersion)
      return JSON.parse(value)
    } catch (err: any) {
      if (err.type === 'NotFoundError') {
        return 0
      }
      throw err
    }
  }

  private async setSchemaVersion (schemaVersion: number): Promise<void> {
    await this.metadataDb.put(metadataKeys.schemaVersion, JSON.stringify(schemaVersion))
    // Update cache
    this.schemaVersion = schemaVersion
  }

  async getIterator (): Promise<AsyncIterableIterator<MessageWrapper>> {
    return new MessageIterator(this.db)
  }

  /**
   * This will delete everything in the store! Don't call it by accident!
   */
  async clear () {
    await this.db.clear()
    await this.metadataDb.clear()
  }
}
