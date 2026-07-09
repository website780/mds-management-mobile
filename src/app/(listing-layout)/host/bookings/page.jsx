// pages/host/bookings/page.jsx
"use client";

import BookingFlow from "@/components/walkinbookings/BookingFlow";
import BookingStats from "@/components/walkinbookings/BookingStats";
import {
    fetchAllBookings,
    fetchBookingStats,
} from "@/redux/features/bookings/bookingSlice";
import Link from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function BookingsPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const dispatch = useDispatch();
  const { bookings, bookingStats, isLoading } = useSelector(
    (state) => state.booking,
  );

  useEffect(() => { 
    const saved = localStorage.getItem("selectedProperty");
    if (saved) {
      setSelectedProperty(JSON.parse(saved));
    }

    const handlePropertyChange = (event) => {
      setSelectedProperty(event.detail);
    };

    window.addEventListener("propertyChanged", handlePropertyChange);
    return () =>
      window.removeEventListener("propertyChanged", handlePropertyChange);
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      dispatch(fetchAllBookings({ propertyId: selectedProperty._id }));
      dispatch(fetchBookingStats({ propertyId: selectedProperty._id }));
    }
  }, [selectedProperty, dispatch]);

  const handleRoomClick = (room, action) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  if (!selectedProperty) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Property Selected
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Please select a property from the sidebar to view bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden p-2 md:p-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 truncate max-w-[250px] sm:max-w-none">
            {selectedProperty.placeName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link href={"/host/allbookings"} className="flex-1 sm:flex-none">
            <button className="w-full bg-[#1035ac] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-[#0d2b8a] transition-colors text-sm font-medium">
              View All Bookings
            </button>
          </Link>
          <Link href={"/host/occupancy"} className="flex-1 sm:flex-none">
            <button className="w-full bg-[#1035ac] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-[#0d2b8a] transition-colors text-sm font-medium">
              View All Rooms
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <BookingStats stats={bookingStats} />

      {/* Booking Flow */}
      <BookingFlow
        selectedProperty={selectedProperty}
        selectedRoom={selectedRoom}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedRoom(null);
        }}
      />
    </div>
  );
}
