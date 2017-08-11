'use strict'

const assert = require('assert')
const {
  flow,
  identity,
  isFunction,
  isUndefined,
  map,
  negate,
  size,
  sortBy,
} = require('lodash/fp')

const { isObjectId } = require('../index.js')

const prettyJson = obj => JSON.stringify(obj, null, 2)
const isDefined = negate(isUndefined)

const stringifyObjectId = o => {
  assert(isObjectId(o), `Argument is not an ObjectId: ${prettyJson(o)}`)
  return o.toString()
}

const assertSameObjectId = (actual, expected, msg) => {
  assert.strictEqual(stringifyObjectId(actual), stringifyObjectId(expected), msg)
}

const assertNotSameObjectId = (actual, expected, msg) => {
  assert.notStrictEqual(stringifyObjectId(actual), stringifyObjectId(expected), msg)
}

/**
 * Throws if the given Mongoose objects don't match
 * @method assertSameDocument
 * @param {Object} actual - Mongoose model instance
 * @param {Object} expected - Mongoose model instance
 * @param {String} msg - Optional custom error message
 * @return {undefined} - Throws if assertions fail
 */
const assertSameDocument = (actual, expected, msg) => {
  const isMongooseDoc = d => isDefined(d._id) && isFunction(d.toObject)
  assert(isMongooseDoc(actual), 'assertSameDocument: 1st argument is not a Mongoose Document')
  assert(isMongooseDoc(expected), 'assertSameDocument: 2nd argument is not a Mongoose Document')
  assertSameObjectId(actual._id, expected._id, msg)
  assert.deepEqual(actual.toObject(), expected.toObject(), msg)
}

/**
 * Throws if the given actual and expected arrays of ObjectIds don't match
 * @method assertSameDocumentIdArray
 * @param {ObjectId[]} actual - Array of ObjectId
 * @param {ObjectId[]} expected - Array of ObjectId
 * @param {String} msg - Optional custom error message
 * @return {undefined} - Throws if assertions fail
 */
function assertSameObjectIdArray(actual, expected, msg) {
  assert(actual instanceof Array, 'assertSameObjectIdArray: First argument is not an Array.')
  assert(expected instanceof Array, 'assertSameObjectIdArray: Second argument is not an Array.')
  assert(size(actual) > 0 || size(expected) > 0, 'assertSameObjectIdArray: Received two empty Arrays.')
  assert.strictEqual(size(actual), size(expected), 'assertSameObjectIdArray: arrays different sizes')
  const parseIds = flow(map(stringifyObjectId), sortBy(identity))
  try { parseIds(actual) } catch (e) { throw Error(`assertSameObjectIdArray 1st argument: ${e.message}`) }
  try { parseIds(expected) } catch (e) { throw Error(`assertSameObjectIdArray 2nd argument: ${e.message}`) }
  assert.deepStrictEqual(parseIds(actual), parseIds(expected), msg)
}

/**
 * Throws if the id's don't match in the given actual and expected arrays
 * @method assertSameDocumentIdArray
 * @param {Object[]} actual - Array of Mongoose model instances
 * @param {Object[]} expected - Array of Mongoose model instances
 * @param {String} msg - Optional custom error message
 * @return {undefined} - Throws if assertions fail
 */
const assertSameDocumentIdArray = (actual, expected, msg) => {
  assert(actual instanceof Array, 'assertSameDocumentIdArray: 1st argument is not an Array.')
  assert(expected instanceof Array, 'assertSameDocumentIdArray: 2nd argument is not an Array.')
  assert(size(actual) > 0 || size(expected) > 0, 'assertSameDocumentIdArray: Received two empty Arrays.')
  assert.strictEqual(size(actual), size(expected), 'assertSameDocumentIdArray: arrays different sizes')
  const getIds = map('_id')
  assertSameObjectIdArray(getIds(actual), getIds(expected), msg)
}

/**
 * Throws if the objects in the actual and expected arrays don't match
 * @method assertSameDocumentArray
 * @param {Object[]} actual - Array of Mongoose model instances
 * @param {Object[]} expected - Array of Mongoose model instances
 * @param {String} msg - Optional custom error message
 * @return {undefined} - Throws if assertions fail
 */
const assertSameDocumentArray = (actual, expected, msg) => {
  assert(actual instanceof Array, 'assertSameDocumentArray: 1st argument is not an Array.')
  assert(expected instanceof Array, 'assertSameDocumentArray: 2nd argument is not an Array.')
  assert(size(actual) > 0 || size(expected) > 0, 'assertSameDocumentArray: Received two empty Arrays.')
  assert.strictEqual(size(actual), size(expected), 'assertSameDocumentArray: arrays different sizes')
  const actualSorted = sortBy('_id')(actual)
  const expectedSorted = sortBy('_id')(expected)
  for (let i = 0; i < size(actual); i++) {
    assertSameDocument(actualSorted[i], expectedSorted[i], msg)
  }
}

// https://nodejs.org/api/assert.html#assert_assert_throws_block_error_message
/**
 * Custom assert that does an exact match of the error message thrown.
 * Existing assert.throws takes in a regex to match, which might cause unexpected results
 * @method assertThrows
 * @param {Function} fn - The block you want to execute to test, takes no args
 * @param {String} expectedErrMsg - The expected error message
 * @param {String} msg - (Optional) A message you'd like to show if the assert fails
 * @return {undefined}
 */
const assertThrows = (fn, expectedErrMsg, msg) => {
  try {
    fn()
  } catch (err) {
    assert.strictEqual(err.message, expectedErrMsg, msg)
    return
  }
  throw Error('assertThrows: didn\'t throw')
}

module.exports = {
  assertNotSameObjectId,
  assertSameDocument,
  assertSameDocumentArray,
  assertSameDocumentIdArray,
  assertSameObjectId,
  assertSameObjectIdArray,
  assertThrows,
}
