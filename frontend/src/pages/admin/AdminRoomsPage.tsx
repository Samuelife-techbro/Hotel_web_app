import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, CheckCircle2, XCircle } from 'lucide-react';
import { roomsApi } from '../../services/api';
import type { Room } from '../../types';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', room_number: '', category: 'standard' as Room['category'],
  description: '', price_per_night: '', capacity: 2, floor: 1,
  size_sqm: 30, is_available: true, amenities: '', image_url: '',
};

function RoomModal({ room, onClose, onSaved }: {
  room: Room | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState(room ? {
    ...EMPTY_FORM,
    name: room.name,
    room_number: room.room_number,
    category: room.category,
    description: room.description,
    price_per_night: room.price_per_night,
    capacity: room.capacity,
    floor: room.floor,
    size_sqm: room.size_sqm,
    is_available: room.is_available,
    amenities: room.amenities.join(', '),
    image_url: room.image_url || '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: string, v: string | number | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = 'Required';
    if (!form.room_number) errs.room_number = 'Required';
    if (!form.price_per_night) errs.price_per_night = 'Required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    const data = new FormData();
    Object.entries({ ...form, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) }).forEach(([k, v]) => {
      if (k === 'amenities') data.append(k, JSON.stringify(v));
      else data.append(k, String(v));
    });

    try {
      if (room) await roomsApi.update(room.id, data);
      else await roomsApi.create(data);
      toast.success(room ? 'Room updated!' : 'Room created!');
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      if (e.response?.data) {
        const apiErrs: Record<string, string> = {};
        Object.entries(e.response.data).forEach(([k, v]) => apiErrs[k] = Array.isArray(v) ? v[0] : String(v));
        setErrors(apiErrs);
      } else toast.error('Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-display text-xl text-charcoal-950">{room ? 'Edit Room' : 'Add New Room'}</h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-950"><X size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {([
            ['name', 'Room Name', 'text', false],
            ['room_number', 'Room Number', 'text', false],
            ['price_per_night', 'Price / Night ($)', 'number', false],
            ['capacity', 'Capacity', 'number', false],
            ['floor', 'Floor', 'number', false],
            ['size_sqm', 'Size (m²)', 'number', false],
            ['image_url', 'Image URL', 'url', true],
          ] as [string, string, string, boolean][]).map(([k, label, type, full]) => (
            <div key={k} className={full ? 'col-span-2' : ''}>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} value={String((form as Record<string, unknown>)[k])}
                onChange={e => update(k, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                className={`input-field ${errors[k] ? 'border-red-400' : ''}`} />
              {errors[k] && <p className="font-sans text-xs text-red-500 mt-1">{errors[k]}</p>}
            </div>
          ))}
          <div>
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}
              className="input-field bg-white">
              {['standard', 'deluxe', 'suite', 'presidential'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="font-sans text-sm text-charcoal-700">Available</label>
            <button
              onClick={() => update('is_available', !form.is_available)}
              className={`relative w-10 h-5 transition-colors ${form.is_available ? 'bg-emerald-500' : 'bg-stone-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="col-span-2">
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">
              Amenities (comma-separated)
            </label>
            <input value={form.amenities} onChange={e => update('amenities', e.target.value)}
              placeholder="WiFi, AC, TV, Mini Bar" className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={3} className="input-field resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-100">
          <button onClick={onClose} className="btn-outline py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary py-2">
            {saving ? 'Saving...' : room ? 'Save Changes' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState<Room | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomsApi.list();
      setRooms(res.data.results || res.data);
    } catch { setRooms([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await roomsApi.delete(deleteId);
      toast.success('Room deleted');
      setDeleteId(null);
      fetchRooms();
    } catch { toast.error('Cannot delete room with active bookings'); setDeleteId(null); }
  };

  const toggleAvailability = async (room: Room) => {
    try {
      await roomsApi.update(room.id, { is_available: !room.is_available });
      toast.success(`Room ${room.room_number} ${!room.is_available ? 'enabled' : 'disabled'}`);
      fetchRooms();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal-950">Rooms</h1>
          <p className="font-sans text-sm text-charcoal-500 mt-1">{rooms.length} rooms managed</p>
        </div>
        <button onClick={() => setEditRoom(null)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-100 overflow-hidden">
            <div className="h-40 skeleton" />
            <div className="p-4 space-y-2">
              <div className="h-5 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
            </div>
          </div>
        )) : rooms.map(room => (
          <div key={room.id} className="bg-white border border-stone-100 overflow-hidden group">
            <div className="relative h-40 overflow-hidden">
              <img
                src={room.display_image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <span className="bg-charcoal-950/80 text-white font-sans text-xs px-2 py-1 uppercase tracking-wider">
                  {room.category}
                </span>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setEditRoom(room)}
                  className="w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                  <Pencil size={12} className="text-charcoal-700" />
                </button>
                <button onClick={() => setDeleteId(room.id)}
                  className="w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-base text-charcoal-950">{room.name}</h3>
                <span className="font-display text-lg text-charcoal-800">${room.price_per_night}</span>
              </div>
              <p className="font-sans text-xs text-charcoal-400 mb-3">
                Room #{room.room_number} · Floor {room.floor} · {room.capacity} guests · {room.size_sqm}m²
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map(a => (
                    <span key={a} className="font-sans text-xs bg-stone-100 text-charcoal-500 px-2 py-0.5">{a}</span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="font-sans text-xs text-charcoal-400">+{room.amenities.length - 3}</span>
                  )}
                </div>
                <button onClick={() => toggleAvailability(room)} className="flex items-center gap-1.5 font-sans text-xs">
                  {room.is_available
                    ? <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">Available</span></>
                    : <><XCircle size={13} className="text-red-400" /><span className="text-red-500">Disabled</span></>
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {editRoom !== undefined && (
        <RoomModal room={editRoom} onClose={() => setEditRoom(undefined)} onSaved={fetchRooms} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4">
          <div className="bg-white p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-display text-xl text-charcoal-950 mb-2">Delete Room?</h3>
            <p className="font-sans text-sm text-charcoal-500 mb-6">
              This action cannot be undone. Rooms with active bookings cannot be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-outline py-2">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white font-sans text-sm px-4 py-2 hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
