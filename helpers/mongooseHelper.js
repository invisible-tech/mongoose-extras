'use strict'

const assert = require('assert')
const uniqueValidator = require('mongoose-unique-validator')
const mongoose = require('mongoose')

const { stripIndents } = require('common-tags')
const {
  bind,
  isFunction,
  isString,
  forEach,
  get,
  map,
  mapValues,
} = require('lodash/fp')

const ERROR_NO_OBJECT_ID = 'Argument is not a mongoose instance'

const forEachValueKey = forEach.convert({ cap: false })

/**
 * Gets the Id of a Mongoose Model.
 * @method getId
 * @param {Model} model - The Model from Mongoose (see mongoose.model('User'))
 * @return {String}
 */
const getId = get('_id')

/**
 * Gets the Id of several Mongoose Models.
 * @method getIds
 * @param {Array} models - An array of Models from Mongoose (see mongoose.model('User'))
 * @return {Array} - return an array with the ids from each model given.
 */
const getIds = map(getId)

/**
 * Returns a boolean if the object given is an instance of Mongoose Object Id.
 * @method isObjectId
 * @param {ObjectId} a - A Mongoose Object Id (see mongoose.Types.ObjectId)
 * @return {Boolean} - A boolean representing if the object given is an instance of Mongoose Object Id.
 * @throws {Error} - Throws if the input is not an instance of Mongoose Object Id (mongoose.Types.ObjectId)
 */
const isObjectId = a => (a instanceof mongoose.Types.ObjectId)

/**
 * Pick the Ids of several Mongoose Models.
 * @method getId
 * @param {Array} models - An array of Models from Mongoose (see mongoose.model('User'))
 * @return {Array} - An array of strings with the Ids.
 */
const pickIds = mapValues(v => getId(v))

const getObjectIdFrom = instance => {
  if (isObjectId(instance)) return instance
  if (isObjectId(getId(instance))) return getId(instance)
  throw Error(stripIndents`
    getObjectIdFrom: ${ERROR_NO_OBJECT_ID}
    ${JSON.stringify(instance)}`)
}

/**
 * A boolean representing if the objects given have the same Mongoose Object Id.
 * Throws if the objects given aren't a Mongoose Object Id.
 * @method isSameObjectId
 * @param {ObjectId} a - A Mongoose Object Id (see mongoose.Types.ObjectId)
 * @param {ObjectId} b - A Mongoose Object Id (see mongoose.Types.ObjectId)
 * @return {Boolean} - A boolean representing if the objects given have the same Mongoose Object Id.
 * @throws {Error} - Throws if the inputs are not Object Ids (mongoose.Types.ObjectId)
 */
function isSameObjectId(a, b) {
  assert(isObjectId(a), '1st argument is not an ObjectId')
  assert(isObjectId(b), '2nd argument is not an ObjectId')
  return a.toString() === b.toString()
}

/**
 * Throws if a given object is not an instance of given model.
 * @method assertInstance
 * @param {Mixed} instance - Could be anything, but most likely a mongoose Model
 * @param {Model} model - The Model from Mongoose (see mongoose.model('User'))
 * @return {undefined}
 * @throws {Error} - Throws if input is not an instance of model, or if model doesn't exist
 */
function assertInstance(instance, model) {
  const modelName = get('modelName')(model)
  try {
    mongoose.model(modelName)
  } catch (e) {
    throw Error(`no such model as ${modelName}`)
  }
  const errMsg = stripIndents`
    Expected an instance of ${modelName} but got this:
    ${JSON.stringify(instance, undefined, 2)}`
  assert(instance instanceof model, errMsg)
}

/**
 * Adds indexes to a given Mongoose Schema.
 * @method addIndexes
 * @param {Schema} options.schema - The Schema to which we are adding indexes
 * @param {Object[]} options.indexes - An array of objects that follows
 *   Mongoose's index format, like [ { a: 1 }, { b: -1} ]
 * @return {undefined} - Mutates the schema directly
 */
const addIndexes = ({ schema, indexes }) => {
  forEach(index => schema.index(index))(indexes)
}

/**
 * Adds unique indexes to a given Mongoose Schema. Also adds the uniqueness validator
 *   which adds a pre-save hook to enforce uniqueness.
 * @method addUniqueIndexes
 * @param {Schema} options.schema - The Schema to which we are adding indexes
 * @param {Object[]} options.uniqueIndexes - An array of objects that follows
 *   Mongoose's index format, like [ { a: 1 }, { b: -1} ]
 * @return {undefined} - Mutates the schema directly
 */
const addUniqueIndexes = ({ schema, uniqueIndexes }) => {
  forEach(index => schema.index(index, { unique: true }))(uniqueIndexes)
  schema.plugin(uniqueValidator)
}

/**
 * Adds virtuals (getters only) to a given Mongoose Schema.
 * @method addVirtualGetters
 * @param {Schema} options.schema - The Schema to which we are adding virtuals
 * @param {Object} options.virtuals - An object of key value pairs,
 *   where the key is the virtual we are setting, and the value is the getter function
 *   Example: const virtuals = {
 *     bot: 'raw.is_bot',
 *     deleted: function() { return this.deleted },
 *     fullName: function() { return `${this.name.first} ${this.name.last}` },
 *   }
 * @return {undefined} - Mutates the schema directly
 */
const addVirtualGetters = ({ schema, virtuals }) => {
  const addVirtualGetter = (v, k) => schema.virtual(k).get(function () {
    if (isFunction(v)) return bind(v)(this)()
    if (isString(v)) return get(v)(this)
    throw Error(`The ${k} value should be a function or a string`)
  })
  forEachValueKey(addVirtualGetter)(virtuals) // eslint-disable-line lodash-fp/no-unused-result
}

/**
 * Apply hook for the following methods: find, findOne, update, findOneAndUpdate, count.
 * @method hookAllMethods
 * @param {Schema} options.schema - the Mongoose Schema for the model
 * @param {Object} hook - the hook to be applied.
 * @return {undefined}
 */
const hookAllMethods = ({ schema, hook }) => {
  const methods = ['find', 'findOne', 'update', 'findOneAndUpdate', 'count']
  forEach(method => schema.pre(method, hook))(methods)
}

/**
 * Apply several hooks for all methods in a Mongoose Schema.
 * @method applyAllHooks
 * @param {Schema} options.schema - the Mongoose Schema for the model
 * @param {Object} hooks - the hooks to be applied.
 * @return {undefined}
 */
const applyAllHooks = ({ schema, hooks }) => {
  forEach(hook => hookAllMethods({ schema, hook }))(hooks)
}

/**
 * Creates a model with the given name and schema, or returns it if it already exists.
 * @method upsertModel
 * @param {String} options.name - the name of the model, like Client
 * @param {Schema} options.schema - the Mongoose Schema for the model
 * @return {Model} - the Mongoose Model
 */
const upsertModel = ({ name, schema }) => {
  assert(name, 'Model name not given')
  try {
    return mongoose.model(name)
  } catch (e) {
    assert(schema, `Model schema not given for ${name}`)
    return mongoose.model(name, schema)
  }
}

const safeObjectId = (x = '') => {
  try {
    return new mongoose.Types.ObjectId(x)
  } catch (err) {
    return undefined
  }
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
  safeObjectId,
  upsertModel,
}
