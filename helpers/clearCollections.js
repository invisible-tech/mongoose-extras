'use strict'

const mongoose = require('mongoose')
const { promisify } = require('util')
const retry = require('retry')
const {
  flow,
  get,
  map,
  reject,
  startsWith,
} = require('lodash/fp')

const isSystemCollection = flow(get('collectionName'), startsWith('system.'))

const getCollections = () => reject(isSystemCollection)(mongoose.connection.collections)

const retryPromise = fn => {
  const operation = retry.operation({
    retries: 10,
    factor: 2,
    minTimeout: 10,
    maxTimeout: 1000,
  })
  return new Promise((res, rej) => { // eslint-disable-line promise/param-names
    operation.attempt(() => {
      const onError = err => {
        if (operation.retry(err)) return
        rej(err)
        console.err(Error('Connection timed out.')) // eslint-disable-line no-console
        process.exit(1)
      }
      fn().then(res).catch(onError)
    })
  })
}

const clearAllIndexes = async () => {
  const deleteIndexes = collection => promisify(collection.dropIndexes.bind(collection))()
  const collections = getCollections()
  await Promise.all(map(deleteIndexes)(collections))
}

const clearAllCollections = async () => {
  const deleteCollection = c => c.deleteMany({}, { w: 1 })
  const collections = getCollections()
  await Promise.all(map(deleteCollection)(collections))
}

/**
 * Clear all collections.
 * @method clearCollections
 * @return {undefined}
 */
const clearCollections = () => retryPromise(clearAllCollections)

/**
 * Clear all Indexes
 * @method clearIndexes
 * @return {undefined}
 */
const clearIndexes = () => retryPromise(clearAllIndexes)

module.exports = {
  clearCollections,
  clearIndexes,
}
