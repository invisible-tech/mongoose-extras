'use strict'

const mongoose = require('mongoose')

const {
  assertNotSameObjectId,
  assertSameDocument,
  assertSameDocumentArray,
  assertSameDocumentIdArray,
  assertSameObjectId,
  assertSameObjectIdArray,
  assertThrows,
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
  dbShutdown,
  getConnection,
  initConnection,
} = require('./config/index.js')

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
  assertThrows,
  clearCollections,
  clearIndexes,
  dbShutdown,
  getConnection,
  getId,
  getIds,
  hookAllMethods,
  initConnection,
  isObjectId,
  isSameObjectId,
  mongoose,
  pickIds,
  upsertModel,
}
