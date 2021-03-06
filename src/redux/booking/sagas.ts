import { call, fork, put, race, take } from 'redux-saga/effects'

import { actionCreators } from 'Redux/booking'

export function* doSomething(action) {
  yield call(console.log, 'GOT ACTION:', action)
}

export function* watchBooking() {
  while (true) {
    yield take('CREATE_BOOKING_PENDING')
    const { failure, success } = yield race({
      failure: take('CREATE_BOOKING_FAILURE'),
      success: take('CREATE_BOOKING_SUCCESS'),
    })
    if (success) {
      yield call(doSomething, success)
      yield put(actionCreators.bookingSuccess(success.payload))
    }
    if (failure) {
      yield call(doSomething, failure)
    }
  }
}

export const sagas = function* bookingSagas() {
  yield fork(watchBooking)
}
