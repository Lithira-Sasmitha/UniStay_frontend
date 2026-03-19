import React from 'react';
import { User, Calendar } from 'lucide-react';

const FilmHallView = ({ rooms }) => {
    if (!rooms || rooms.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                No rooms found for this property.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {rooms.map((room) => {
                const occupants = room.currentOccupants || [];
                const totalSeats = room.totalCapacity || 0;
                const availableSeats = totalSeats - occupants.length;

                // Build seat array: occupied slots first, then empty
                const seats = [
                    ...occupants.map((o) => ({ occupied: true, occupant: o })),
                    ...Array(availableSeats).fill({ occupied: false }),
                ];

                return (
                    <div key={room._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        {/* Room header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg capitalize">
                                    {room.roomType} Room
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    {occupants.length}/{totalSeats} occupied &nbsp;•&nbsp; LKR {room.monthlyRent?.toLocaleString()}/mo
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                                    <span className="text-xs font-semibold text-slate-500">Occupied</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />
                                    <span className="text-xs font-semibold text-slate-500">Available</span>
                                </div>
                            </div>
                        </div>

                        {/* Seat grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {seats.map((seat, idx) => (
                                <div
                                    key={idx}
                                    title={
                                        seat.occupied && seat.occupant?.student
                                            ? `${seat.occupant.student.name} — booked ${new Date(seat.occupant.bookingDate).toLocaleDateString()}`
                                            : 'Available'
                                    }
                                    className={`
                    relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all cursor-default
                    ${seat.occupied
                                            ? 'bg-emerald-50 border-2 border-emerald-200 shadow-sm shadow-emerald-100'
                                            : 'bg-slate-50 border-2 border-dashed border-slate-200'}
                  `}
                                >
                                    {seat.occupied ? (
                                        <>
                                            <User className="w-5 h-5 text-emerald-600 mb-1" />
                                            <p className="text-[9px] font-bold text-emerald-700 leading-tight line-clamp-2">
                                                {seat.occupant?.student?.name || 'Student'}
                                            </p>
                                            {seat.occupant?.bookingDate && (
                                                <div className="flex items-center gap-0.5 mt-1">
                                                    <Calendar className="w-2.5 h-2.5 text-emerald-400" />
                                                    <span className="text-[8px] text-emerald-400">
                                                        {new Date(seat.occupant.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl mb-1 text-slate-300">🛏</span>
                                            <p className="text-[9px] font-bold text-slate-400">Free</p>
                                        </>
                                    )}

                                    {/* Seat number badge */}
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-slate-200 text-[8px] font-black text-slate-500 flex items-center justify-center shadow-sm">
                                        {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FilmHallView;
