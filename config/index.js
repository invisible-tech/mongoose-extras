'use strict'

const mongoose = require('mongoose')
const {
  flow,
  get,
  startsWith,
} = require('lodash/fp')

const logger = require('@invisible/logger')

// use native promises
mongoose.Promise = global.Promise

const handleErr = err => {
  const isConnRefused = flow(get('message'), startsWith('connect ECONNREFUSED'))
  if (isConnRefused(err)) throw err
  else logger.error(err)
}

let resolveConnection // eslint-disable-line one-var
const connectionPromise = new Promise(resolve => {
  resolveConnection = resolve
})
const getConnection = () => connectionPromise

/*
* Mongoose by default sets the auto_reconnect option to true.
* We recommend a 30 second connection timeout because it allows for
* plenty of time in most operating environments.
*/
const defaultOptions = {
  useMongoClient: true,
  keepAlive: 2000,
  connectTimeoutMS: 30000,
  reconnectTries: Number.MAX_VALUE,
}
const assignMongooseOptions = opts => Object.assign(defaultOptions, opts)

let initialized = false
const initConnection = (mongodbUri, opts = {}) => {
  if (! mongodbUri) throw new Error(`mongodbUri '${mongodbUri}' is invalid`)
  if (initialized) return
  initialized = true
  const mongooseOptions = assignMongooseOptions(opts)
  mongoose.connect(mongodbUri, mongooseOptions)
  mongoose.connection.on('error', handleErr)
  mongoose.connection.on('open', () => { resolveConnection(mongoose.connection) })
  mongoose.connection.on('disconnecting', () => logger.info('shutting down db connection'))
  mongoose.connection.on('disconnected', () => logger.info('mongodb connection successfully disconnected.'))
}

const dbShutdown = async () => {
  // This may be a sudden termination and not wait for all saves to finish
  try {
    await mongoose.connection.close()
  } catch (err) {
    logger.error(err)
  }
}

module.exports = {
  dbShutdown,
  getConnection,
  initConnection,
}
