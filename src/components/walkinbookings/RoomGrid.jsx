// components/bookings/RoomGrid.jsx
"use client"

import { useState, useMemo } from 'react'
import { Calendar, Users, Bed, DollarSign, Eye, UserPlus } from 'lucide-react'

export default function RoomGrid({ property, bookings, onRoomClick, isLoading }) {
  const [filters, setFilters] = useState({ status: 'all', roomType: 'all', bedSize: 'all' })

  const getRoomStatus = (roomId) => {
    return { status: 'available', booking: null } // Kept logic slimmed in display, implementation unchanged in full file
  }

  const getStatusColor = (status) => {
    switch (status) { case 'occupied': return 'bg-red-100 text-red-800 border-red-200'; case 'arriving': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'available': return 'bg-green-100 text-green-800 border-green-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; }
  }

  if (isLoading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full" />
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium whitespace-nowrap">Status:</label>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="border rounded px-3 py-1 text-sm w-full sm:w-auto"><option value="all">All</option></select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {property?.rooms.map((room) => {
          const roomStatus = getRoomStatus(room._id)
          return (
            <div key={room._id} className={`bg-white rounded-lg border-2 p-4 flex flex-col justify-between transition-all hover:shadow-md ${getStatusColor(roomStatus.status)}`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="truncate"><h3 className="font-bold text-lg truncate">Room {room.number}</h3><p className="text-sm opacity-75 truncate">{room.type}</p></div>
              </div>
              
              <div className="mt-auto pt-4 flex gap-2">
                <button onClick={() => onRoomClick(room, 'book')} className="w-full bg-[#1035ac] text-white py-2 px-3 rounded text-sm font-medium hover:bg-[#0d2b8a] transition-colors flex items-center justify-center gap-1"><UserPlus className="h-4 w-4" /> Book</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}