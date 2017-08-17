'use strict'

require('dotenv').config({ path: `${__dirname}/.env` })

const {
  assertNotSameObjectId,
  assertSameDocument,
  assertSameDocumentArray,
  assertSameDocumentIdArray,
  assertSameObjectId,
  assertSameObjectIdArray,
} = require('./customAsserts/documentAssertions.js')

const {
  clearCollections,
  clearIndexes,
} = require('./helpers/clearCollections.js')

const {
  addIndexes,
  addUniqueIndexes,
  addVirtualGetters,
  applyAllHooks,
  assertInstance,
  getId,
  getIds,
  hookAllMethods,
  isObjectId,
  isSameObjectId,
  pickIds,
  upsertModel,
} = require('./helpers/mongooseHelper.js')

const {
  DB,
  dbShutdown,
  getConnection,
  init,
} = require('./config')

module.exports = {
  addIndexes,
  addUniqueIndexes,
  addVirtualGetters,
  applyAllHooks,
  assertNotSameObjectId,
  assertSameDocument,
  assertSameDocumentArray,
  assertSameDocumentIdArray,
  assertSameObjectId,
  assertSameObjectIdArray,
  assertInstance,
  clearCollections,
  clearIndexes,
  DB,
  dbShutdown,
  getConnection,
  getId,
  getIds,
  hookAllMethods,
  init,
  isObjectId,
  isSameObjectId,
  pickIds,
  upsertModel,
}
