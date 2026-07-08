// components/BookingInvoice.jsx
"use client"
import { useRef, useState } from "react"
import logo from "../../../public/mds.svg";
import toast from "react-hot-toast";

export default function BookingInvoice({ booking, onClose }) {
  const invoiceRef = useRef()
  const [isDownloading, setIsDownloading] = useState(false)

const handleDownload = async () => {
  if (!invoiceRef.current) return;

  setIsDownloading(true);
  try {
    // Wait for all images inside invoice to load
    const images = invoiceRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // ignore errors
        });
      })
    );

    const html2pdf = (await import("html2pdf.js")).default;

    const element = invoiceRef.current;

    const opt = {
    //   margin: 0, // or adjust width as explained above
      filename: `MyDivineStays-Invoice-${booking?.bookingId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate invoice. Please try again.");
  } finally {
    setIsDownloading(false);
  }
};


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const calculateNights = () => {
    const checkIn = new Date(booking?.checkIn)
    const checkOut = new Date(booking?.checkOut)
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex w-full items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white  rounded-lg max-w-4xl flex w-full items-center justify-center flex-col my-8">
        {/* Header Controls */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 w-full flex justify-between items-center z-10 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Booking Invoice</h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg hover:bg-[#1e40af] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div ref={invoiceRef} className="p-8  bg-white" style={{ width: '190mm', minHeight: '277mm' }}>
            {/* Header with Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #1e3a8a' }}>
              <div>
                <img 
                  src={logo.src}
                  alt="MyDivineStays"
                  style={{ height: '64px', marginBottom: '8px' }}
                  crossOrigin="anonymous"
                />
                <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>INVOICE</h1>
                <p style={{ color: '#4b5563', marginTop: '4px' }}>Booking Confirmation</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>BOOKING ID</p>
                  <p style={{ fontFamily: 'monospace',  fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{booking.bookingId}</p>
                </div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Invoice Date: {formatDate(new Date())}</p>
              </div>
            </div>

            {/* Company & Guest Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '12px', textTransform: 'uppercase' }}>From</h3>
                <div style={{ fontSize: '14px' }}>
                  <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '4px 0' }}>MyDivineStays</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>Premium Accommodation Services</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>Email: support@mydivinestays.com</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>Web: www.mydivinestays.com</p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '12px', textTransform: 'uppercase' }}>Billed To</h3>
                <div style={{ fontSize: '14px' }}>
                  <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '4px 0' }}>
                    {booking?.primaryGuest?.firstName} {booking?.primaryGuest?.lastName}
                  </p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>{booking?.primaryGuest?.email}</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>{booking?.primaryGuest?.phone}</p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #1e3a8a', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px', textTransform: 'uppercase' }}>Property Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#1f2937', margin: '4px 0' }}>{booking?.property?.placeName}</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>{booking?.property?.location?.street}</p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>Room Type: {booking?.room}</p>
                </div>
                <div>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>
                    <span style={{ fontWeight: '600' }}>Check-in:</span> {formatDate(booking?.checkIn)}
                  </p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>
                    <span style={{ fontWeight: '600' }}>Check-out:</span> {formatDate(booking?.checkOut)}
                  </p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>
                    <span style={{ fontWeight: '600' }}>Duration:</span> {calculateNights()} Night(s)
                  </p>
                  <p style={{ color: '#4b5563', margin: '4px 0' }}>
                    <span style={{ fontWeight: '600' }}>Guests:</span> {booking?.guestCount?.adults} Adult(s), {booking?.guestCount?.children} Child(ren)
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600' }}>Nights</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600' }}>Guests</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '600' }}>Amount</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px' }}>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{booking?.property?.placeName}</p>
                    <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '4px' }}>{booking?.room}</p>
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px', color: '#374151' }}>{calculateNights()}</td>
                  <td style={{ textAlign: 'center', padding: '16px', color: '#374151' }}>
                    {(booking?.guestCount?.adults || 0) + (booking?.guestCount?.children || 0)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', fontWeight: '600', color: '#1f2937' }}>
                    ₹{(booking?.pricing?.baseAmount || booking?.pricing?.totalAmount)?.toLocaleString('en-IN')}
                  </td>
                </tr>
                
                {booking?.pricing?.taxes && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td colSpan="3" style={{ padding: '12px 16px', textAlign: 'right', color: '#4b5563' }}>
                      Taxes & Fees
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', color: '#374151' }}>
                      ₹{booking?.pricing?.taxes?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
              {console.log(booking?.pricing, "pricing")}
              <tfoot>
                <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                  <td colSpan="3" style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                    TOTAL AMOUNT
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', fontWeight: 'bold', fontSize: '20px' }}>
                    ₹{booking?.pricing?.totalAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Payment Status */}
            <div style={{ marginBottom: '24px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 4px 0' }}>Payment Method</p>
                  <p style={{ fontWeight: '600', color: '#1f2937', textTransform: 'uppercase', margin: 0 }}>{booking?.payment?.method}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 4px 0' }}>Payment Status</p>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 12px', 
                    paddingBottom:'20px',
                    borderRadius: '9999px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    backgroundColor: booking?.payment?.status === 'completed' ? '#dcfce7' : '#fef3c7',
                    color: booking?.payment?.status === 'completed' ? '#166534' : '#92400e'
                  }}>
                    {booking?.payment?.status === 'completed' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '12px', textTransform: 'uppercase' }}>Terms & Conditions</h3>
              <ul style={{ fontSize: '12px', color: '#4b5563', listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>• Check-in time: 12:00 PM | Check-out time: 11:00 AM</li>
                <li style={{ marginBottom: '4px' }}>• Please carry a valid government-issued photo ID proof for check-in</li>
                <li style={{ marginBottom: '4px' }}>• Free cancellation up to 24 hours before check-in date</li>
                <li style={{ marginBottom: '4px' }}>• Contact property directly for any special requests or modifications</li>
                <li style={{ marginBottom: '4px' }}>• Guests are responsible for any damage to property during their stay</li>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '2px solid #1e3a8a', paddingTop: '16px' }}>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 4px 0' }}>Thank you for choosing MyDivineStays!</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                For any queries, please contact us at support@mydivinestays.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}