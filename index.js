'use strict'

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
  dbConnection,
  dbShutdown,
  getConnection,
  initConnection,
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
  dbConnection,
  dbShutdown,
  getConnection,
  getId,
  getIds,
  hookAllMethods,
  initConnection,
  isObjectId,
  isSameObjectId,
  pickIds,
  upsertModel,
}
