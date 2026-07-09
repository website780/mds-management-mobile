// components/BookingPage.jsx
"use client";
import { createBooking } from "@/redux/features/bookings/bookingSlice";
import {
    clearPaymentUrl,
    initiatePhonePePayment,
} from "@/redux/features/payments/paymentSlice";
import {
    AlertCircle,
    Bed,
    Calendar,
    ChevronDown,
    ChevronUp,
    Layers,
    Users,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {toast} from "@backpackapp-io/react-native-toast";
import { useDispatch, useSelector } from "react-redux";

const nightlyRate = (room, adults, extraGaddis = 0) => {
  if (!room) return 0;
  const base = room.pricing?.baseAdultsCharge || 0;
  const eRate = room.pricing?.extraAdultsCharge || 0;
  const gaddiRate = room.pricing?.extraFloorBeddingCharge || 0;
  return (
    base +
    Math.max(0, adults - (room.occupancy?.baseAdults || 1)) * eRate +
    extraGaddis * gaddiRate
  );
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const REQUIRED_FIELDS = [
  { field: "firstName", label: "First Name" },
  { field: "lastName", label: "Last Name" },
  { field: "phone", label: "Mobile" },
  { field: "email", label: "Email" },
  { field: "idNumber", label: "ID Number" },
];

export default function BookingPage({ property, selectedRooms = [] }) {
  const dispatch = useDispatch();
  const { isCreating, error: bookingError } = useSelector((s) => s.booking);
  const {
    isInitiating,
    paymentUrl,
    merchantTransactionId,
    error: paymentError,
  } = useSelector((s) => s.payment);

  const [bookingDetails, setBookingDetails] = useState(null);
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "aadhar",
    idNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    age: "20",
    gender: "male",
  });
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    dispatch(clearPaymentUrl());
  }, [dispatch]);

  useEffect(() => {
    if (paymentUrl && merchantTransactionId) {
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({ merchantTransactionId, timestamp: Date.now() }),
      );
      window.location.href = paymentUrl;
    }
  }, [paymentUrl, merchantTransactionId]);

  useEffect(() => {
    const sq = JSON.parse(localStorage.getItem("lastSearchQuery") || "{}");
    if (sq?.checkin && selectedRooms?.length) {
      const ci = new Date(sq.checkin),
        co = new Date(sq.checkout);
      setBookingDetails({
        checkin: sq.checkin,
        checkout: sq.checkout,
        totalDays: Math.ceil((co - ci) / 864e5),
      });
    }
  }, [selectedRooms]);

  useEffect(() => {
    if (bookingError) toast.error(bookingError);
    if (paymentError) toast.error(paymentError);
  }, [bookingError, paymentError]);

  const perRoomPricing = useMemo(() => {
    if (!bookingDetails) return [];
    return selectedRooms.map((sr) => {
      const ro = sr.roomObj;
      if (!ro) return null;
      const adults = sr.guestCount.adults || 1;
      const extraGaddis = sr.guestCount.extraGaddis || 0;
      const rate = nightlyRate(ro, adults, extraGaddis);
      const sub = rate * bookingDetails.totalDays;
      const taxes = sub * 0.12;
      const extraAdults = Math.max(0, adults - (ro.occupancy?.baseAdults || 1));
      return {
        base: ro.pricing.baseAdultsCharge * bookingDetails.totalDays,
        extraAdults:
          extraAdults *
          (ro.pricing.extraAdultsCharge || 0) *
          bookingDetails.totalDays,
        gaddi:
          extraGaddis *
          (ro.pricing.extraFloorBeddingCharge || 0) *
          bookingDetails.totalDays,
        subtotal: sub,
        taxes,
        total: sub + taxes,
        adults,
        extraGaddis,
      };
    });
  }, [bookingDetails, selectedRooms]);

  const grandTotal = useMemo(
    () => perRoomPricing.reduce((s, p) => s + (p?.total || 0), 0),
    [perRoomPricing],
  );
  const totalAdults = useMemo(
    () => selectedRooms.reduce((s, r) => s + (r.guestCount?.adults || 0), 0),
    [selectedRooms],
  );
  const totalGaddis = useMemo(
    () =>
      selectedRooms.reduce((s, r) => s + (r.guestCount?.extraGaddis || 0), 0),
    [selectedRooms],
  );

  const fieldErrors = useMemo(() => {
    const errs = {};
    for (const { field, label } of REQUIRED_FIELDS) {
      if (!guestDetails[field]?.toString().trim())
        errs[field] = `${label} is required`;
    }
    if (
      guestDetails.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)
    ) {
      errs.email = "Enter a valid email address";
    }
    if (
      guestDetails.phone &&
      !/^[6-9]\d{9}$/.test(guestDetails.phone.replace(/\D/g, ""))
    ) {
      errs.phone = "Enter a valid 10-digit mobile number";
    }
    return errs;
  }, [guestDetails]);

  const isFormValid = Object.keys(fieldErrors).length === 0;
  const canProceed = isFormValid && agreeTerms;

  const showError = (field) =>
    (touched[field] || submitAttempted) && fieldErrors[field];
  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleInput = (field, value, nested = null) => {
    // Phone: only allow digits, max 10 characters
    if (field === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    if (nested)
      setGuestDetails((p) => ({
        ...p,
        [nested]: { ...p[nested], [field]: value },
      }));
    else setGuestDetails((p) => ({ ...p, [field]: value }));
  };
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSubmitAttempted(true);
    const allTouched = {};
    for (const { field } of REQUIRED_FIELDS) allTouched[field] = true;
    setTouched(allTouched);

    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      const firstErrorField = REQUIRED_FIELDS.find(
        ({ field }) => fieldErrors[field],
      )?.field;
      document
        .getElementById(`field-${firstErrorField}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    const bookingData = {
      propertyId: property._id,
      rooms: selectedRooms.map((sr) => ({
        roomId: sr.roomId,
        guestCount: sr.guestCount,
      })),
      primaryGuest: guestDetails,
      checkIn: bookingDetails.checkin,
      checkOut: bookingDetails.checkout,
      guestCount: { adults: totalAdults, extraGaddis: totalGaddis },
      paymentMethod,
      specialRequests,
      source: "online",
    };

    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      toast.success("Booking created successfully!");
      localStorage.setItem("currentBooking", JSON.stringify(result));
      sessionStorage.removeItem("roomsCart_v3");
      await dispatch(
        initiatePhonePePayment({
          bookingId: result._id,
          phone: guestDetails.phone,
        }),
      ).unwrap();
      toast.loading("Redirecting to payment…");
    } catch (err) {
      toast.error(err || "Something went wrong");
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      showError(field)
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-200 focus:ring-blue-500"
    }`;

  if (!bookingDetails)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading booking details…</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Booking Summary
              </h2>
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: "#1035ac" }}
                >
                  {property.placeName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {property.placeName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {property.location.city}, {property.location.state}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(bookingDetails.checkin).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )}{" "}
                      →{" "}
                      {new Date(bookingDetails.checkout).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {totalAdults} adult{totalAdults > 1 ? "s" : ""}
                      {totalGaddis > 0 && (
                        <span className="flex items-center gap-1 ml-1">
                          <Layers className="h-3 w-3 text-amber-500" />
                          {totalGaddis} gaddi
                        </span>
                      )}
                    </span>
                    <span>
                      {bookingDetails.totalDays} night
                      {bookingDetails.totalDays > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Per-room accordion */}
              <div className="space-y-2">
                {selectedRooms.map((sr, i) => {
                  const p = perRoomPricing[i];
                  const expanded = expandedRoom === sr.cartKey;
                  return (
                    <div
                      key={sr.cartKey}
                      className="border border-gray-100 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedRoom(expanded ? null : sr.cartKey)
                        }
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Bed className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {sr.roomName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {sr.guestCount.adults}A
                          {sr.guestCount.extraGaddis > 0 && (
                            <span className="text-amber-500">
                              {" "}
                              · {sr.guestCount.extraGaddis} gaddi
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 ml-2">
                          ₹{fmtINR(p?.total || 0)}
                        </span>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {expanded && p && (
                        <div className="px-4 pb-3 pt-1 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Base × {bookingDetails.totalDays}N</span>
                            <span>₹{fmtINR(p.base)}</span>
                          </div>
                          {p.extraAdults > 0 && (
                            <div className="flex justify-between">
                              <span>Extra adults</span>
                              <span>₹{fmtINR(p.extraAdults)}</span>
                            </div>
                          )}
                          {p.gaddi > 0 && (
                            <div className="flex justify-between text-amber-600 font-medium">
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Gaddi × {p.extraGaddis}
                              </span>
                              <span>₹{fmtINR(p.gaddi)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>GST 12%</span>
                            <span>₹{fmtINR(p.taxes)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-gray-700 pt-1 border-t border-gray-200">
                            <span>Room Total</span>
                            <span>₹{fmtINR(p.total)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Primary Guest Details
                </h2>
                {submitAttempted && !isFormValid && (
                  <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {Object.keys(fieldErrors).length} field
                    {Object.keys(fieldErrors).length > 1 ? "s" : ""} required
                  </span>
                )}
              </div>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-firstName">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.firstName}
                      onChange={(e) => handleInput("firstName", e.target.value)}
                      onBlur={() => markTouched("firstName")}
                      placeholder="Rajesh"
                      className={inputClass("firstName")}
                    />
                    {showError("firstName") && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div id="field-lastName">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.lastName}
                      onChange={(e) => handleInput("lastName", e.target.value)}
                      onBlur={() => markTouched("lastName")}
                      placeholder="Sharma"
                      className={inputClass("lastName")}
                    />
                    {showError("lastName") && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div id="field-phone">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      value={guestDetails.phone}
                      inputMode="numeric" // forces numeric keyboard on Android
                      maxLength={10}
                      onChange={(e) => handleInput("phone", e.target.value)}
                      onBlur={() => markTouched("phone")}
                      placeholder="9876543210"
                      className={inputClass("phone")}
                    />
                    {showError("phone") && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div id="field-email">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guestDetails.email}
                      onChange={(e) => handleInput("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      placeholder="rajesh@example.com"
                      className={inputClass("email")}
                    />
                    {showError("email") && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <select
                      value={guestDetails.age}
                      onChange={(e) => handleInput("age", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {Array.from({ length: 83 }, (_, i) => i + 18).map((a) => (
                        <option key={a} value={String(a)}>
                          {a} years
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={guestDetails.gender}
                      onChange={(e) => handleInput("gender", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Proof *
                    </label>
                    <select
                      value={guestDetails.idType}
                      onChange={(e) => handleInput("idType", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="aadhar">Aadhar Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div id="field-idNumber">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.idNumber}
                      onChange={(e) => handleInput("idNumber", e.target.value)}
                      onBlur={() => markTouched("idNumber")}
                      placeholder="1234 5678 9012"
                      className={inputClass("idNumber")}
                    />
                    {showError("idNumber") && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">Important Information</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-600">
                <li>Valid ID proof is mandatory for check-in</li>
                <li>Check-in: 12:00 PM · Check-out: 11:00 AM</li>
                <li>Cancellation allowed up to 24 hours before check-in</li>
              </ul>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div className="space-y-2">
                {[
                  {
                    val: "upi",
                    label: "UPI Payment",
                    sub: "Google Pay, PhonePe, Paytm",
                    badge: "Instant",
                    bc: "green",
                  },
                  {
                    val: "bank_transfer",
                    label: "Net Banking",
                    sub: "Direct from your bank",
                    badge: "Secure",
                    bc: "blue",
                  },
                  {
                    val: "card",
                    label: "Credit/Debit Card",
                    sub: "Visa, Mastercard, RuPay",
                    badge: "Popular",
                    bc: "yellow",
                  },
                ].map(({ val, label, sub, badge, bc }) => (
                  <label
                    key={val}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === val ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={val}
                      checked={paymentMethod === val}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 text-sm">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full bg-${bc}-100 text-${bc}-700`}
                    >
                      {badge}
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex items-start gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs text-gray-500">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 underline">
                    Terms & Conditions
                  </a>
                  ,{" "}
                  <a href="#" className="text-blue-600 underline">
                    Privacy Policy
                  </a>
                  , and{" "}
                  <a href="#" className="text-blue-600 underline">
                    Cancellation Policy
                  </a>
                  .
                </span>
              </label>

              {/* Contextual hint when checkbox ticked but form incomplete */}
              {agreeTerms && !isFormValid && (
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Please complete all required guest details before
                    proceeding.
                  </p>
                </div>
              )}

              {/* Contextual hint when form done but checkbox unticked */}
              {!agreeTerms && isFormValid && submitAttempted && (
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Please accept the terms and conditions to continue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">
                  Price Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  {selectedRooms.map((sr, i) => {
                    const p = perRoomPricing[i];
                    if (!p) return null;
                    return (
                      <div key={sr.cartKey} className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {sr.roomName}
                        </p>
                        <div className="flex justify-between text-gray-500">
                          <span>Base × {bookingDetails.totalDays}N</span>
                          <span>₹{fmtINR(p.base)}</span>
                        </div>
                        {p.extraAdults > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Extra adults</span>
                            <span>₹{fmtINR(p.extraAdults)}</span>
                          </div>
                        )}
                        {p.gaddi > 0 && (
                          <div className="flex justify-between text-amber-600 font-medium">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              Gaddi × {p.extraGaddis}
                            </span>
                            <span>₹{fmtINR(p.gaddi)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                          <span>GST 12%</span>
                          <span>₹{fmtINR(p.taxes)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <hr className="border-gray-100" />
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span style={{ color: "#1035ac" }}>
                      ₹{fmtINR(grandTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Proceed button */}
                <button
                  onClick={handleSubmit}
                  disabled={isCreating || isInitiating || !canProceed}
                  className="w-full mt-5 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: "#1035ac" }}
                  title={
                    !isFormValid
                      ? "Fill in all required fields to continue"
                      : !agreeTerms
                        ? "Accept terms and conditions to continue"
                        : undefined
                  }
                >
                  {isCreating || isInitiating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isCreating ? "Creating…" : "Initiating Payment…"}
                    </>
                  ) : !isFormValid ? (
                    "Complete form to proceed"
                  ) : !agreeTerms ? (
                    "Accept terms to proceed"
                  ) : (
                    "Proceed to Payment →"
                  )}
                </button>

                {/* Checklist below button */}
                <div className="mt-3 space-y-1.5">
                  {[
                    { done: isFormValid, label: "Guest details filled" },
                    { done: agreeTerms, label: "Terms accepted" },
                  ].map(({ done, label }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-1.5 text-xs ${done ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-100" : "bg-gray-100"}`}
                      >
                        {done ? (
                          <svg
                            className="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
                        )}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secured by PhonePe
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="font-bold text-gray-900 mb-3 text-sm">
                  Why Book With Us?
                </p>
                {[
                  "Instant confirmation",
                  "24×7 customer support",
                  "Secure payment",
                  "Free cancellation (24h)",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <svg
                        className="w-2.5 h-2.5 text-green-600"
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
                    <span className="text-xs text-gray-500">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
