'use strict'

const assert = require('assert')
const mongoose = require('mongoose')

const {
  assertNotSameObjectId,
  assertSameDocument,
  assertSameDocumentArray,
  assertSameDocumentIdArray,
  assertSameObjectId,
  assertSameObjectIdArray,
  assertThrows,
} = require('../../customAsserts/documentAssertions.js')

const { ObjectId } = mongoose.Types

const toObject = function () {
  return this
}

describe('documentAssertions', () => {
  describe('assertSameDocument()', () => {
    it('should accept single values', () => {
      const _id = new ObjectId()
      assertSameDocument({ _id, toObject }, { _id, toObject })
    })

    it('should throw if ids are not equal', () => {
      const expected = { _id: new ObjectId(), toObject }
      const actual = { _id: new ObjectId(), toObject }
      assertThrows(() => assertSameDocument(expected, actual, 'msg'), 'msg')
    })

    it('should throw if not passing Mongoose Documents', () => {
      const expected = { _id: new ObjectId(), toObject }
      const actual = [{ _id: new ObjectId(), toObject }]
      assertThrows(
        () => assertSameDocument(expected, actual, 'msg'),
        'assertSameDocument: 2nd argument is not a Mongoose Document'
      )
    })
  })

  describe('assertSameDocumentArray()', () => {
    it('shouldn\'t care for ordering', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      assertSameDocumentArray(
        [{ _id, a: 1, toObject }, { _id: _id2, b: 2, toObject }],
        [{ _id: _id2, b: 2, toObject }, { _id, a: 1, toObject }]
      )
    })

    it('should throw if not the same array', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      const expected = [{ _id, toObject }, { _id: _id2, a: 1, toObject }]
      const actual = [{ _id, toObject }, { _id: _id2, a: 2, toObject }]
      assertThrows(() => assertSameDocumentArray(expected, actual, 'msg'), 'msg')
    })

    it('should throw if not passing Arrays', () => {
      const expected = { _id: new ObjectId(), toObject }
      const actual = [{ _id: new ObjectId(), toObject }]
      assertThrows(
        () => assertSameDocumentArray(expected, actual),
        'assertSameDocumentArray: 1st argument is not an Array.'
      )
    })
  })

  describe('assertSameDocumentIdArray()', () => {
    it('shouldn\'t care for ordering', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      assertSameDocumentIdArray(
        [{ _id, a: 1, toObject }, { _id: _id2, toObject }],
        [{ _id: _id2, b: 2, toObject }, { _id, toObject }]
      )
    })

    it('should throw if not the same array', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      const _id3 = new ObjectId()
      const expected = [{ _id, toObject }, { _id: _id2, toObject }]
      const actual = [{ _id, toObject }, { _id: _id3, toObject }]
      assertThrows(() => assertSameDocumentIdArray(expected, actual, 'msg'), 'msg')
    })

    it('should throw if not passing Arrays', () => {
      const expected = { _id: new ObjectId(), toObject }
      const actual = [{ _id: new ObjectId(), toObject }]
      assertThrows(
        () => assertSameDocumentIdArray(expected, actual),
        'assertSameDocumentIdArray: 1st argument is not an Array.'
      )
    })
  })

  describe('assertSameObjectIdArray()', () => {
    it('shouldn\'t care for ordering', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      assertSameObjectIdArray([_id, _id2 ], [_id2, _id])
    })

    it('should throw if not the same array', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      const _id3 = new ObjectId()
      const expected = [_id, _id2]
      const actual = [_id, _id3]
      assertThrows(() => assertSameObjectIdArray(expected, actual, 'msg'), 'msg')
    })

    it('should throw if not passing Arrays', () => {
      const expected = new ObjectId()
      const actual = [new ObjectId()]
      assertThrows(
        () => assertSameObjectIdArray(expected, actual),
        'assertSameObjectIdArray: First argument is not an Array.'
      )
    })
  })

  describe('assertSameObjectId()', () => {
    it('should accept same ObjectId', () => {
      const _id = new ObjectId()
      assertSameObjectId(_id, _id)
    })

    it('should throw if ObjectIds are not equal', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      assertThrows(() => assertSameObjectId(_id, _id2, 'msg'), 'msg')
    })
  })

  describe('assertNotSameObjectId', () => {
    it('should pass with different ObjectIds', () => {
      const _id = new ObjectId()
      const _id2 = new ObjectId()
      assertNotSameObjectId(_id, _id2)
    })

    it('should throw if ObjectIds are equal', () => {
      const _id = new ObjectId()
      assertThrows(() => assertNotSameObjectId(_id, _id, 'msg'), 'msg')
    })

    it('should throw if argument is not ObjectId', () => {
      const _id = new ObjectId()
      assert.throws(() => assertNotSameObjectId('a', 'a', 'msg'))
      assert.throws(() => assertNotSameObjectId(_id, 'a', 'msg'))
    })
  })

  describe('assertThrows', () => {
    const msg = 'wab dab lub dab'
    const otherMsg = 'weeeeeeeeeee'

    it('should pass if err messages match', () => {
      assertThrows(() => { throw new Error(msg) }, msg)
    })

    it('should throw if err messages don\'t match', () => {
      try {
        assertThrows(() => { throw new Error(msg) }, otherMsg, 'actual message')
      } catch (err) {
        assert.strictEqual(err.message, 'actual message')
      }
    })

    it('should throw if block doesn\'t throw', () => {
      try {
        assertThrows(() => 1 + 1, msg, 'actual message')
      } catch (err) {
        assert.strictEqual(err.message, 'assertThrows: didn\'t throw')
      }
    })
  })
})
