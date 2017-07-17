'use strict'

const assert = require('assert')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { stripIndents } = require('common-tags')
const {
  forEach,
  get,
  map,
  mapValues,
} = require('lodash/fp')

const { exportForTest } = require('./utility')

const ERROR_NO_OBJECT_ID = 'Argument is not a mongoose instance'

const forEachValueKey = forEach.convert({ cap: false })
const getId = get('_id')
const getIds = map(getId)
const isObjectId = a => (a instanceof mongoose.Types.ObjectId)
const pickIds = mapValues(v => getId(v))

const getObjectIdFrom = instance => {
  if (isObjectId(instance)) return instance
  if (isObjectId(getId(instance))) return getId(instance)
  throw Error(stripIndents`
    getObjectIdFrom: ${ERROR_NO_OBJECT_ID}
    ${JSON.stringify(instance)}`)
}

function isSameObjectId(a, b) {
  assert(isObjectId(a), '1st argument is not an ObjectId')
  assert(isObjectId(b), '2nd argument is not an ObjectId')
  return a.toString() === b.toString()
}

/**
 * Throws if a given object is not an instance of given model
 * @method assertInstance
 * @param {Mixed} input - Could be anything, but most likely a mongoose Model
 * @param {Model} model - The Model from Mongoose (see mongoose.model('User'))
 * @return {undefined}
 * @throws {Error} - Throws if input is not an instance of model, or if model doesn't exist
 */
function assertInstance(input, model) {
  const modelName = get('modelName')(model)
  try { mongoose.model(modelName) }
  catch (e) { throw Error(`no such model as ${modelName}`) }
  const errMsg = stripIndents`
    Expected an instance of ${modelName} but got this:
    ${JSON.stringify(input, undefined, 2)}`
  assert(input instanceof model, errMsg)
}

/**
 * Adds indexes to a given Mongoose Schema
 * @method addIndexes
 * @param {Schema} options.schema - The Schema to which we are adding indexes
 * @param {Object[]} options.indexes - An array of objects that follows
 *   Mongoose's index format, like [ { a: 1 }, { b: -1} ]
 * @return {undefined} - Mutates the schema directly
 */
const addIndexes = ({ schema, indexes }) => {
  forEachValueKey((value, key) => schema.index({ value: key }))(indexes)
}

/**
 * Adds unique indexes to a given Mongoose Schema. Also adds the uniqueness validator
 *   which adds a pre-save hook to enforce uniqueness.
 * @method addIndexes
 * @param {Schema} options.schema - The Schema to which we are adding indexes
 * @param {Object[]} options.uniqueIndexes - An array of objects that follows
 *   Mongoose's index format, like [ { a: 1 }, { b: -1} ]
 * @return {undefined} - Mutates the schema directly
 */
const addUniqueIndexes = ({ schema, uniqueIndexes }) => {
  forEachValueKey((value, key) =>
    schema.index({ value: key }, { unique: true }))(uniqueIndexes)
  schema.plugin(uniqueValidator)
}

/**
 * Adds virtuals (getters only) to a given Mongoose Schema
 * @method addVirtualGetters
 * @param {Schema} options.schema - The Schema to which we are adding virtuals
 * @param {Object} options.virtuals - An object of key value pairs,
 *   where the key is the virtual we are setting, and the value is the path to a sub-document
 *   Example: const virtuals = {
 *     bot: 'raw.is_bot',
 *     deleted: 'raw.deleted',
 *   }
 * @return {undefined} - Mutates the schema directly
 */
const addVirtualGetters = ({ schema, virtuals }) => {
  const addVirtualGetter = (v, k) => schema.virtual(k).get(function() { return get(v)(this) })
  forEachValueKey(addVirtualGetter)(virtuals) // eslint-disable-line lodash-fp/no-unused-result
}

const hookAllMethods = ({ schema, hook }) => {
  const methods = ['find', 'findOne', 'update', 'findOneAndUpdate', 'count']
  forEach(method => schema.pre(method, hook))(methods)
}

const applyAllHooks = ({ schema, hooks }) => {
  forEach(hook => hookAllMethods({ schema, hook }))(hooks)
}

module.exports = {
  addIndexes,
  addUniqueIndexes,
  addVirtualGetters,
  applyAllHooks,
  assertInstance,
  getId,
  getIds,
  getObjectIdFrom,
  hookAllMethods,
  isObjectId,
  isSameObjectId,
  pickIds,
}

exportForTest(module, {
  ERROR_NO_OBJECT_ID,
})
