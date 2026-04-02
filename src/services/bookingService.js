import api from './api';

/** Request a booking for a room (student) */
export const requestBooking = (roomId) =>
    api.post('/bookings', { roomId });

/** Get student's own bookings */
export const getStudentBookings = () =>
    api.get('/bookings/my-bookings');

/** Submit review for a booking */
export const submitBookingReview = (bookingId, payload) =>
    api.post(`/bookings/${bookingId}/review`, payload);

/** Create Stripe PaymentIntent for advance */
export const createPaymentIntent = (bookingId) =>
    api.post(`/bookings/${bookingId}/payment-intent`);

/** Confirm advance payment */
export const confirmPayment = (bookingId) =>
    api.patch(`/bookings/${bookingId}/confirm-payment`);

/** Cancel own booking */
export const cancelBooking = (bookingId) =>
    api.patch(`/bookings/${bookingId}/cancel`);

/** Get student's current confirmed boarding (room, property, roommates) */
export const getMyBoarding = () =>
    api.get('/bookings/my-boarding');

/** Get all bookings for owner's properties */
export const getOwnerBookings = () =>
    api.get('/bookings/owner-bookings');

/** Approve a booking (owner) */
export const approveBooking = (bookingId) =>
    api.patch(`/bookings/${bookingId}/approve`);

/** Reject a booking (owner) with a reason */
export const rejectBooking = (bookingId, rejectionReason) =>
    api.patch(`/bookings/${bookingId}/reject`, { rejectionReason });
