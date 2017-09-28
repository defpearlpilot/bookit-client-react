import { delay } from 'redux-saga'
import { call, fork, put, takeEvery } from 'redux-saga/effects'
import { cloneableGenerator } from 'redux-saga/utils'

import * as ActionTypes from 'ActionTypes'
import { bookingComplete, bookingSuccess, bookingFailure } from 'Actions'

import booking, { watchBooking, makeBooking } from './booking'

describe('sagas/booking', () => {
  describe('#booking()', () => {
    it('forks watchBooking()', () => {
      const saga = booking()
      const expected = fork(watchBooking)

      expect(saga.next().value).to.deep.equal(expected)
      expect(saga.next().done).to.be.true
    })
  })

  describe('#watchBooking()', () => {
    it('yields takeEvery(ActionTypes.BOOKING_REQUEST, makeBooking)', () => {
      const saga = watchBooking()
      const expected = takeEvery(ActionTypes.BOOKING_REQUEST, makeBooking)

      expect(saga.next().value).to.deep.equal(expected)
      expect(saga.next().done).to.be.true
    })
  })

  describe('#makeBooking()', () => {
    it('yields BOOKING_SUCCESS when there are no errors and BOOKING_FAILURE when there are', () => {
      const saga = cloneableGenerator(makeBooking)()
      const errorSaga = saga.clone()
      const error = {}

      expect(saga.next().value).to.deep.equal(call(delay, 2000))
      expect(saga.next().value).to.deep.equal(put(bookingSuccess()))
      expect(saga.next().value).to.deep.equal(call(delay, 500))
      expect(saga.next().value).to.deep.equal(put(bookingComplete()))
      expect(saga.next().done).to.be.true

      errorSaga.next()

      expect(errorSaga.throw(error).value).to.deep.equal(put(bookingFailure(error)))
      expect(errorSaga.next().value).to.deep.equal(call(delay, 500))
      expect(errorSaga.next().value).to.deep.equal(put(bookingComplete()))
      expect(errorSaga.next().done).to.be.true
    })
  })
})
