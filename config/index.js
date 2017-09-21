'use strict'

/* eslint-disable no-console */

const mongoose = require('mongoose')
const {
  flow,
  get,
  startsWith,
} = require('lodash/fp')

// use native promises
mongoose.Promise = global.Promise

const handleErr = err => {
  const isConnRefused = flow(get('message'), startsWith('connect ECONNREFUSED'))
  if (isConnRefused(err)) throw err
  else console.log(`ERROR: ${err}`)
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
  mongoose.connection.on('disconnecting', () => console.log('INFO: shutting down db connection'))
  mongoose.connection.on('disconnected', () => console.log('INFO: mongodb connection successfully disconnected.'))
}

const dbShutdown = async () => {
  // This may be a sudden termination and not wait for all saves to finish
  try {
    await mongoose.connection.close()
  } catch (err) {
    console.log(`ERROR: ${err}`)
  }
}

module.exports = {
  dbShutdown,
  getConnection,
  initConnection,
}
