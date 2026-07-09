// components/bookings/BookingStats.jsx
import { Calendar } from "lucide-react-native";

export default function BookingStats({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings || 0,
      color: "bg-blue-500",
    },
    {
      title: "Checked In",
      value: stats.checkedInBookings || 0,
      color: "bg-green-500",
    },
    {
      title: "Confirmed Bookings",
      value: stats.confirmedBookings || 0,
      color: "bg-yellow-500",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      color: "bg-[#1035ac]", // Updated to brand color
    },
  ];

  return (
    <div className="grid grid-cols-2   sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border p-4 shadow-sm w-full"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-500 truncate">
                {stat.title}
              </p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-gray-900 truncate">
                {stat.value}
              </p>
            </div>
            <div
              className={`shrink-0 w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center`}
            >
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
