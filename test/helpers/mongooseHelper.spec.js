'use strict'

const assert = require('assert')
const mongoose = require('mongoose')
const {
  forEach,
  get,
  head,
  last,
  map,
} = require('lodash/fp')

const {
  addIndexes,
  addUniqueIndexes,
  addVirtualGetters,
  assertInstance,
  pickIds,
  isObjectId,
  isSameObjectId,
  upsertModel,
} = require('../../helpers/mongooseHelper.js')

const { Schema } = mongoose
const { ObjectId } = mongoose.Types
const { Mixed } = Schema.Types

const forEachValueKey = forEach.convert({ cap: false })

describe('mongooseHelper', () => {
  const modelSchema = new Schema({})

  const DummyModel = mongoose.model('DummyModel', modelSchema)

  describe('isSameObjectId', () => {
    const a = new ObjectId()
    const b = new ObjectId()

    it('should compare two ObjectIds', () => {
      const result = isSameObjectId(a, a)

      assert.strictEqual(result, true)
    })

    it('should throw if not ObjectId', () => {
      assert.throws(() => isSameObjectId('string', 'string'))
    })

    it('should return false for different ObjectIds', () => {
      const result = isSameObjectId(a, b)

      assert.strictEqual(result, false)
    })
  })

  describe('pickIds', () => {
    it('should pick the ids of the models', () => {
      const obj1 = new DummyModel()
      const obj2 = new DummyModel()

      assert.deepStrictEqual({ obj1: obj1._id, obj2: obj2._id }, pickIds({ obj1, obj2 }))
    })
  })

  describe('isObjectId', () => {
    it('should test if the argument is an object Id', () => {
      const a = new ObjectId()

      assert.strictEqual(isObjectId(a), true)
      assert.strictEqual(isObjectId(1), false)
    })
  })

  describe('addIndexes', () => {
    it('should add indexes', async () => {
      const schema = new Schema({})
      const indexes = [
        { a: 1 },
        { b: -1 },
        { d: 1 },
      ]

      addIndexes({ schema, indexes })

      const actualIndexes = map(head)(schema.indexes())
      assert.deepStrictEqual(actualIndexes, indexes)
    })
  })

  describe('addUniqueIndexes', () => {
    it('should add unique indexes', async () => {
      const uniqueIndexes = [
        { a: 1, b: -1 },
        { b: 1, d: -1 },
      ]

      addUniqueIndexes({ schema: modelSchema, uniqueIndexes })

      const actualIndexes = modelSchema.indexes()
      forEachValueKey((v, k) => {
        const index = head(v)
        const attributes = last(v)
        const { unique } = attributes
        assert.deepStrictEqual(uniqueIndexes[k], index)
        assert.strictEqual(true, unique)
      })(actualIndexes)
    })
  })

  describe('addVirtualGetters', () => {
    afterEach(() => { delete mongoose.connection.models.Dummy })

    const dummySchema = new Schema({
      a: String,
      b: Number,
      c: {
        d: Mixed,
      },
    })

    it('should add virtual getters', () => {
      const virtuals = {
        subDoc: 'c.d',
        alternateB: 'b',
      }

      addVirtualGetters({ schema: dummySchema, virtuals })

      const DummyModel = mongoose.model('dummy', dummySchema) // eslint-disable-line no-shadow
      const num1 = 1467
      const str1 = 'kingArthur'
      const dummy = new DummyModel({ b: num1, c: { d: str1 } })
      assert.strictEqual(dummy.b, dummy.alternateB)
      assert.strictEqual(dummy.subDoc, dummy.c.d)
      assert.strictEqual(dummy.b, num1)
      assert.strictEqual(dummy.c.d, str1)
    })
  })

  describe('assertInstance', () => {
    it('should throw if not an instance', () => {
      assert.throws(() => assertInstance(123, DummyModel))
    })

    it('should not throw if is an instance', () => {
      const instance = new DummyModel()

      assertInstance(instance, DummyModel)
    })
  })

  describe('upsertModel', () => {
    it('should create the model if it doesn\'t exist', async () => {
      const name = 'testModel'
      const model = upsertModel({ name, schema: modelSchema })
      const modelName = get('modelName')(model)
      assert.strictEqual(modelName, name)
      assert(mongoose.model(modelName)) // this throws if the model doesn't exist
    })

    it('should return an existing model', async () => {
      const name = 'testModel'
      const model = upsertModel({ name, schema: modelSchema })
      const model2 = upsertModel({ name, schema: modelSchema })
      const modelName = get('modelName')(model2)
      assert.strictEqual(modelName, name)
      assert(mongoose.model(modelName)) // this throws if the model doesn't exist
      assert.deepStrictEqual(model, model2)
    })
  })
})
