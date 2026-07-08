"use client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import BookingInvoice from "./BookingInvoice";

export default function BookingConfirmation({ bookingId }) {
  const router = useRouter();
  const [showInvoice, setShowInvoice] = useState(false);

  const { currentBooking: booking, loading } = useSelector(
    (state) => state.booking,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-50 border-b border-green-200 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-800">
                Booking Confirmed!
              </h1>
              <p className="text-green-600 mt-2">
                Your reservation has been successfully created
              </p>
              <p className="text-sm text-green-600 mt-1">
                Booking ID:{" "}
                <span className="font-mono font-bold">
                  {booking?.bookingId}
                </span>
              </p>
            </div>

            {/* Booking Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Property Details
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Property:</span>{" "}
                      {booking?.property?.placeName}
                    </p>
                    <p>
                      <span className="text-gray-600">Location:</span>{" "}
                      {booking?.property?.location?.street}
                    </p>
                    <p>
                      <span className="text-gray-600">Room:</span>{" "}
                      {booking?.room}
                    </p>
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Guest Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      {booking?.primaryGuest?.firstName}{" "}
                      {booking?.primaryGuest?.lastName}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {booking?.primaryGuest?.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {booking?.primaryGuest?.phone}
                    </p>
                  </div>
                </div>

                {/* Stay Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Stay Details</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Check-in:</span>{" "}
                      {new Date(booking?.checkIn).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-gray-600">Check-out:</span>{" "}
                      {new Date(booking?.checkOut).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-gray-600">Guests:</span>{" "}
                      {booking?.guestCount?.adults} Adults,{" "}
                      {booking?.guestCount?.children} Children
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Payment Details
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Total Amount:</span> ₹
                      {booking?.pricing?.totalAmount}
                    </p>
                    <p>
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {booking?.payment?.status?.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Payment Method:</span>{" "}
                      {booking?.payment?.method?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex-1 bg-[#1e3a8a] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1e40af] flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Invoice
                </button>
                <button
                  onClick={() => router.push("/my-bookings")}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  View All Bookings
                </button>
              </div>

              {/* Important Notes */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please carry a valid photo ID proof for check-in</li>
                  <li>• Check-in time: 12:00 PM | Check-out time: 11:00 AM</li>
                  <li>
                    • Contact the property directly for any special requests
                  </li>
                  <li>• Free cancellation up to 24 hours before check-in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <BookingInvoice
          booking={booking}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  );
}
