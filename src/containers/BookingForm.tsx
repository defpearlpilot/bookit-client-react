import React from 'react'
import { connect } from 'react-redux'

import { Field, reduxForm, InjectedFormProps, hasSubmitSucceeded, isSubmitting } from 'redux-form'

import Moment from 'moment'

import { actionCreators } from 'Redux'
import { BookingSelectors } from 'Redux/booking'

import Button from 'Components/Button'

interface BookingFormData {
  bookableId: number
  subject: string
  startDateTime: string
  endDateTime: string
}

interface BookingFormProps {
  submitSucceeded: any
  createBooking: any
  bookingInstance: any
  initialValues: any
}

type AllBookingFormProps = BookingFormProps & InjectedFormProps<BookingFormData>

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning },
}) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </div>
  </div>
)

const renderSuccessMessage = (bookingId) => <h1>Booking Created with booking ID {bookingId}!</h1>

export const BookingForm: React.SFC<AllBookingFormProps> = (props) => {
  const { handleSubmit, createBooking, submitting, bookingInstance } = props

  return (
    <div>
      <form onSubmit={ handleSubmit(createBooking) }>
        <Field name="bookableId" component={ renderField } type="hidden" label="Name of Room" />
        <Field name="subject" component={ renderField } label="My Booking" type="text" />
        <Field name="startDateTime" component={ renderField } label="Start" type="text" />
        <Field name="endDateTime" component={ renderField } label="End" type="text" />
        <Button type="submit" disabled={ submitting } id="bookit">
          Book a Room!
        </Button>
      </form>
      { bookingInstance && renderSuccessMessage(bookingInstance.bookingId) }
    </div>
  )
}

const mapStateToProps = (state) => ({
  bookingInstanceId: BookingSelectors.getBookingInstanceId(state),
  initialValues: {
    bookableId: 1,
    endDateTime: Moment().add(1, 'hours').format('YYYY-MM-DDTHH:mm'),
    startDateTime: Moment().format('YYYY-MM-DDTHH:mm'),
  },
  submitSucceeded: hasSubmitSucceeded('booking')(state),
  submitting: isSubmitting('booking')(state),
})

const formed = reduxForm<BookingFormData>({ form: 'booking' })(BookingForm)

const connected = connect<{}, {}>(
  mapStateToProps,
  { createBooking: actionCreators.createBooking }
)(formed)

export default connected
