// /app/dashboard-layout/components/StatCard.jsx
export default function StatCard({ title, value, icon, trend }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <div className="rounded-full bg-[#1035ac]/10 p-2">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-[#1035ac]">{value}</p>
      {trend && (
        <div className={`mt-2 flex items-center text-xs ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isUp ? '↑' : '↓'} {trend.value}% {trend.text}
        </div>
      )}
    </div>
  )
}