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

let dbConnection

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
  dbConnection = () => mongoose.connection
  dbConnection().on('error', handleErr)
  dbConnection().on('open', () => { resolveConnection(dbConnection) })
  dbConnection().on('disconnecting', () => logger.info('shutting down db connection'))
  dbConnection().on('disconnected', () => logger.info('mongodb connection successfully disconnected.'))
}

const dbShutdown = async () => {
  // This may be a sudden termination and not wait for all saves to finish
  try {
    await dbConnection().close()
  } catch (err) {
    logger.error(err)
  }
}

module.exports = {
  dbConnection,
  dbShutdown,
  getConnection,
  initConnection,
}
