import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, DoorOpen, Plus, Edit3, Trash2, X,
  Loader2, CheckCircle, XCircle, UserMinus, Mail, Phone,
  GraduationCap, CreditCard, User as UserIcon, ChevronDown,
  Home, BedDouble, Clock, AlertTriangle,
} from 'lucide-react';
import {
  addRoom as addRoomApi, updateRoom as updateRoomApi, deleteRoom as deleteRoomApi,
  removeOccupant as removeOccupantApi,
} from '../services/propertyService';
import { approveBooking, rejectBooking } from '../services/bookingService';

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory', 'studio'];
const COMMON_FACILITIES = ['WiFi', 'Air Conditioning', 'Study Desk', 'Wardrobe', 'Attached Bathroom', 'Hot Water', 'Laundry', 'Parking'];

const BoardingArrangeView = ({ data, onRefresh, onBack }) => {
  const { property, rooms, bookings, stats } = data;

  // Modal states
  const [addRoomModal, setAddRoomModal] = useState(false);
  const [editRoomModal, setEditRoomModal] = useState(null);
  const [removeOccupantModal, setRemoveOccupantModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteRoomId, setDeleteRoomId] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);

  // Form state
  const [roomForm, setRoomForm] = useState({
    roomType: 'single', monthlyRent: '', keyMoney: '', advanceAmount: '',
    advanceType: 'fixed', totalCapacity: 1, facilities: [],
  });
  const [removeReason, setRemoveReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const pendingBookings = (bookings || []).filter(b => b.status === 'pending');

  const resetRoomForm = () => setRoomForm({
    roomType: 'single', monthlyRent: '', keyMoney: '', advanceAmount: '',
    advanceType: 'fixed', totalCapacity: 1, facilities: [],
  });

  const openEditRoom = (room) => {
    setRoomForm({
      roomType: room.roomType, monthlyRent: room.monthlyRent,
      keyMoney: room.keyMoney || '', advanceAmount: room.advanceAmount || '',
      advanceType: room.advanceType || 'fixed', totalCapacity: room.totalCapacity,
      facilities: room.facilities || [],
    });
    setEditRoomModal(room._id);
  };

  const toggleFacility = (f) => {
    setRoomForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter(x => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleAddRoom = async () => {
    setActionLoading('add-room');
    setError('');
    try {
      await addRoomApi(property._id, {
        ...roomForm,
        monthlyRent: Number(roomForm.monthlyRent),
        keyMoney: Number(roomForm.keyMoney) || 0,
        advanceAmount: Number(roomForm.advanceAmount) || 0,
        totalCapacity: Number(roomForm.totalCapacity),
      });
      setAddRoomModal(false);
      resetRoomForm();
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add room');
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdateRoom = async () => {
    setActionLoading('edit-room');
    setError('');
    try {
      await updateRoomApi(editRoomModal, {
        ...roomForm,
        monthlyRent: Number(roomForm.monthlyRent),
        keyMoney: Number(roomForm.keyMoney) || 0,
        advanceAmount: Number(roomForm.advanceAmount) || 0,
        totalCapacity: Number(roomForm.totalCapacity),
      });
      setEditRoomModal(null);
      resetRoomForm();
      onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update room');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setActionLoading('delete-room-' + roomId);
    try {
      await deleteRoomApi(roomId);
      setDeleteRoomId(null);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete room');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemoveOccupant = async () => {
    if (!removeOccupantModal) return;
    const { roomId, studentId } = removeOccupantModal;
    setActionLoading('remove-occupant');
    try {
      await removeOccupantApi(roomId, studentId, removeReason);
      setRemoveOccupantModal(null);
      setRemoveReason('');
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to remove occupant');
    } finally {
      setActionLoading('');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    setActionLoading('approve-' + bookingId);
    try {
      await approveBooking(bookingId);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectModal || rejectReason.length < 10) return;
    setActionLoading('reject-' + rejectModal);
    try {
      await rejectBooking(rejectModal, rejectReason);
      setRejectModal(null);
      setRejectReason('');
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading('');
    }
  };

  // Room form fields (shared by add/edit modals)
  const RoomFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Room Type</label>
          <select
            value={roomForm.roomType}
            onChange={e => setRoomForm(prev => ({ ...prev, roomType: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium capitalize"
          >
            {ROOM_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Capacity</label>
          <input
            type="number" min="1"
            value={roomForm.totalCapacity}
            onChange={e => setRoomForm(prev => ({ ...prev, totalCapacity: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Monthly Rent (LKR)</label>
          <input
            type="number" min="1"
            value={roomForm.monthlyRent}
            onChange={e => setRoomForm(prev => ({ ...prev, monthlyRent: e.target.value }))}
            placeholder="15000"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Key Money (LKR)</label>
          <input
            type="number" min="0"
            value={roomForm.keyMoney}
            onChange={e => setRoomForm(prev => ({ ...prev, keyMoney: e.target.value }))}
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Advance Type</label>
          <select
            value={roomForm.advanceType}
            onChange={e => setRoomForm(prev => ({ ...prev, advanceType: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
          >
            <option value="fixed">Fixed Amount</option>
            <option value="half-month">Half Month Rent</option>
          </select>
        </div>
        {roomForm.advanceType === 'fixed' && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Advance (LKR)</label>
            <input
              type="number" min="0"
              value={roomForm.advanceAmount}
              onChange={e => setRoomForm(prev => ({ ...prev, advanceAmount: e.target.value }))}
              placeholder="5000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_FACILITIES.map(f => (
            <button
              key={f} type="button"
              onClick={() => toggleFacility(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${roomForm.facilities.includes(f)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{property?.name}</h2>
            <p className="text-sm text-slate-500">{property?.address}</p>
          </div>
        </div>
        <button
          onClick={() => { resetRoomForm(); setAddRoomModal(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-amber-200"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Rooms', value: stats?.totalRooms || 0, icon: DoorOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Capacity', value: stats?.totalCapacity || 0, icon: BedDouble, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Occupied', value: stats?.totalOccupied || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Vacant', value: stats?.totalVacant || 0, icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending', value: stats?.pendingRequests || 0, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900">Rooms</h3>
        {(rooms || []).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <DoorOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No rooms yet. Add your first room.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => {
              const occupied = room.currentOccupants?.length || 0;
              const available = room.totalCapacity - occupied;
              const pct = room.totalCapacity > 0 ? Math.round((occupied / room.totalCapacity) * 100) : 0;
              const isExpanded = expandedRoom === room._id;

              return (
                <div key={room._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Room Header */}
                  <div
                    onClick={() => setExpandedRoom(isExpanded ? null : room._id)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <DoorOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 capitalize">{room.roomType} Room</h4>
                        <p className="text-xs text-slate-500">
                          LKR {room.monthlyRent?.toLocaleString()}/mo · {room.facilities?.length || 0} facilities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Occupancy bar */}
                      <div className="hidden sm:block w-24">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 text-center">{occupied}/{room.totalCapacity}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditRoom(room)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteRoomId(room._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded: Seat Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          {/* Seat Grid */}
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
                            {Array.from({ length: room.totalCapacity }).map((_, i) => {
                              const occ = room.currentOccupants?.[i];
                              return (
                                <div
                                  key={i}
                                  onClick={() => occ && setRemoveOccupantModal({
                                    roomId: room._id,
                                    studentId: (occ.student?._id || occ.student),
                                    studentName: occ.student?.name || 'Unknown',
                                  })}
                                  className={`relative p-3 rounded-xl text-center transition-all ${occ
                                    ? 'bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                                    : 'bg-slate-50 border-2 border-dashed border-slate-200'
                                  }`}
                                >
                                  <span className="absolute top-1 right-1.5 text-[9px] font-bold text-slate-400">{i + 1}</span>
                                  {occ ? (
                                    <>
                                      <UserIcon className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                                      <p className="text-[10px] font-bold text-emerald-700 truncate">{occ.student?.name?.split(' ')[0] || '?'}</p>
                                    </>
                                  ) : (
                                    <>
                                      <BedDouble className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                                      <p className="text-[10px] font-bold text-slate-400">Free</p>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Legend */}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-200 rounded" /> Occupied (click to remove)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-100 border border-dashed border-slate-300 rounded" /> Available</span>
                          </div>

                          {/* Occupant details */}
                          {(room.currentOccupants?.length || 0) > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-bold text-slate-500 uppercase">Occupant Details</p>
                              {room.currentOccupants.map((occ, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                                      {occ.student?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm text-slate-800">{occ.student?.name}</p>
                                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-0.5">
                                        {occ.student?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {occ.student.email}</span>}
                                        {occ.student?.phonenumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {occ.student.phonenumber}</span>}
                                        {occ.student?.university && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {occ.student.university}</span>}
                                        {occ.student?.nic && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {occ.student.nic}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setRemoveOccupantModal({
                                      roomId: room._id,
                                      studentId: (occ.student?._id || occ.student),
                                      studentName: occ.student?.name || 'Unknown',
                                    })}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3 h-3" /> Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Booking Requests */}
      {pendingBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">Pending Booking Requests ({pendingBookings.length})</h3>
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold">
                        {booking.student?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{booking.student?.name}</p>
                        <p className="text-xs text-slate-500">{booking.room?.roomType} room</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 mt-2">
                      {booking.student?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {booking.student.email}</span>}
                      {booking.student?.phonenumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {booking.student.phonenumber}</span>}
                      {booking.student?.university && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-slate-400" /> {booking.student.university}</span>}
                      {booking.student?.nic && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-slate-400" /> {booking.student.nic}</span>}
                      {booking.student?.age && <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-slate-400" /> Age: {booking.student.age}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveBooking(booking._id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'approve-' + booking._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setRejectModal(booking._id); setRejectReason(''); }}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Room Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {addRoomModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-slate-900">Add New Room</h3>
                <button onClick={() => setAddRoomModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
              <RoomFormFields />
              <button
                onClick={handleAddRoom}
                disabled={!roomForm.monthlyRent || !roomForm.totalCapacity || actionLoading === 'add-room'}
                className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'add-room' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Room
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Room Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {editRoomModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-slate-900">Edit Room</h3>
                <button onClick={() => setEditRoomModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
              <RoomFormFields />
              <button
                onClick={handleUpdateRoom}
                disabled={actionLoading === 'edit-room'}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'edit-room' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Room Confirm ─────────────────────────────────── */}
      <AnimatePresence>
        {deleteRoomId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-black text-slate-900">Delete Room?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">This action cannot be undone. The room and its data will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteRoomId(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  onClick={() => handleDeleteRoom(deleteRoomId)}
                  disabled={actionLoading.startsWith('delete-room')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading.startsWith('delete-room') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Remove Occupant Modal ───────────────────────────────── */}
      <AnimatePresence>
        {removeOccupantModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-slate-900">Remove Occupant</h3>
                <button onClick={() => setRemoveOccupantModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Remove <span className="font-bold">{removeOccupantModal.studentName}</span> from this room? Their booking will be cancelled and they'll be notified via email.
              </p>
              <textarea
                value={removeReason}
                onChange={e => setRemoveReason(e.target.value)}
                placeholder="Reason for removal (optional)..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-slate-900 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setRemoveOccupantModal(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  onClick={handleRemoveOccupant}
                  disabled={actionLoading === 'remove-occupant'}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'remove-occupant' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Booking Modal ────────────────────────────────── */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-slate-900">Reject Booking</h3>
                <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (min 10 characters)..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-slate-900 resize-none mb-4"
              />
              <p className={`text-xs mb-4 ${rejectReason.length < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                {rejectReason.length}/10 minimum characters
              </p>
              <button
                onClick={handleRejectBooking}
                disabled={rejectReason.length < 10 || !!actionLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Rejection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BoardingArrangeView;
