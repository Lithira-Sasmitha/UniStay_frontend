import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    ArrowLeft, CreditCard, Loader2, CheckCircle, AlertCircle,
    ShieldCheck, Home, DollarSign,
} from 'lucide-react';
import { createPaymentIntent, confirmPayment, getStudentBookings } from '../../services/bookingService';

// ── Stripe promise (loaded once) ──────────────────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Inner checkout form (needs Stripe context) ────────────────────────
const CheckoutForm = ({ bookingId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Tell backend the payment is done
                await confirmPayment(bookingId);
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold"
                >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 active:translate-y-0"
            >
                {processing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing…
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-5 h-5" />
                        Pay Securely
                    </>
                )}
            </button>

            <p className="text-center text-xs text-slate-400 font-medium">
                🔒 Secured by Stripe. Your card details never touch our servers.
            </p>
        </form>
    );
};

// ── Main PaymentPage ──────────────────────────────────────────────────
const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch booking details + create payment intent
    const initPayment = useCallback(async () => {
        try {
            // Get booking details from student's bookings list
            const { data } = await getStudentBookings();
            const found = data.bookings?.find((b) => b._id === bookingId);
            if (!found) {
                setError('Booking not found.');
                setLoading(false);
                return;
            }
            if (found.status !== 'approved') {
                setError('This booking is not ready for payment. It must be approved first.');
                setLoading(false);
                return;
            }
            if (found.advancePaid) {
                setError('Advance payment has already been made for this booking.');
                setLoading(false);
                return;
            }
            setBooking(found);

            // Create PaymentIntent
            const piRes = await createPaymentIntent(bookingId);
            setClientSecret(piRes.data.clientSecret);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        initPayment();
    }, [initPayment]);

    // ── Compute advance amount for display ──────────────────────────────
    const advanceAmount = booking?.room
        ? booking.room.advanceType === 'half-month'
            ? booking.room.monthlyRent / 2
            : booking.room.advanceAmount
        : 0;

    // ── Loading state ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                <p className="text-slate-500 font-semibold">Preparing payment…</p>
            </div>
        );
    }

    // ── Error state ─────────────────────────────────────────────────────
    if (error && !booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-lg font-bold text-slate-800">{error}</p>
                <button
                    onClick={() => navigate('/student')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // ── Success state ───────────────────────────────────────────────────
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center"
                >
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful! 🎉</h2>
                    <p className="text-slate-500 font-medium max-w-md">
                        Your advance payment has been received and your booking is now <strong className="text-emerald-600">confirmed</strong>.
                        Welcome to your new home!
                    </p>
                </motion.div>
                <button
                    onClick={() => navigate('/student')}
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // ── Payment form ────────────────────────────────────────────────────
    const stripeOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#4f46e5',
                colorBackground: '#ffffff',
                colorText: '#1e293b',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: '12px',
                spacingUnit: '4px',
            },
        },
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
                {/* Back button */}
                <button
                    onClick={() => navigate('/student')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Page header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Pay Advance</h1>
                            <p className="text-sm text-slate-500 font-medium">Complete your booking</p>
                        </div>
                    </div>

                    {/* Booking summary */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Booking Summary</h2>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <Home className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{booking.property?.name}</p>
                                    <p className="text-xs text-slate-500">{booking.property?.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 capitalize">{booking.room?.roomType} Room</p>
                                    <p className="text-xs text-slate-500">LKR {booking.room?.monthlyRent?.toLocaleString()}/mo</p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <p className="font-bold text-slate-800">Advance Amount</p>
                                </div>
                                <p className="text-xl font-black text-primary-600">
                                    LKR {advanceAmount?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium mt-4 leading-relaxed">
                            💡 This advance payment reduces your first month's rent. It is <strong>not</strong> an additional charge.
                        </p>
                    </div>

                    {/* Stripe Elements */}
                    {clientSecret && (
                        <Elements stripe={stripePromise} options={stripeOptions}>
                            <CheckoutForm bookingId={bookingId} onSuccess={() => setSuccess(true)} />
                        </Elements>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;
