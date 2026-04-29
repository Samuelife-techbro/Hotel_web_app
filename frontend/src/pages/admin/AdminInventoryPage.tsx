import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, Download } from 'lucide-react';
import { inventoryApi } from '../../services/api';
import type { InventoryItem } from '../../types';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', unit: 'piece', total_stock: 0, min_stock_alert: 10 };

function ItemModal({ item, onClose, onSaved }: {
  item: InventoryItem | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState(item ? {
    name: item.name, description: item.description, unit: item.unit,
    total_stock: item.total_stock, min_stock_alert: item.min_stock_alert,
  } : EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item) await inventoryApi.updateItem(item.id, form);
      else await inventoryApi.createItem(form);
      toast.success(item ? 'Item updated!' : 'Item created!');
      onSaved(); onClose();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4">
      <div className="bg-white w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-display text-xl text-charcoal-950">{item ? 'Edit Item' : 'Add Inventory Item'}</h2>
          <button onClick={onClose}><X size={20} className="text-charcoal-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Item Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field" />
          </div>
          <div>
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Unit</label>
            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              placeholder="piece, bottle, set..." className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Total Stock</label>
              <input type="number" min={0} value={form.total_stock}
                onChange={e => setForm(f => ({ ...f, total_stock: parseInt(e.target.value) || 0 }))}
                className="input-field" />
            </div>
            <div>
              <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Alert Below</label>
              <input type="number" min={0} value={form.min_stock_alert}
                onChange={e => setForm(f => ({ ...f, min_stock_alert: parseInt(e.target.value) || 0 }))}
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="input-field resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-100">
          <button onClick={onClose} className="btn-outline py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary py-2">
            {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<InventoryItem | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listItems();
      setItems(res.data.results || res.data);
    } catch { setItems([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await inventoryApi.deleteItem(deleteId);
      toast.success('Item deleted');
      fetchItems();
    } catch { toast.error('Failed to delete item'); }
    setDeleteId(null);
  };

  const handleExport = async () => {
    try {
      const res = await inventoryApi.exportCSV();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const lowStockItems = items.filter(i => i.is_low_stock);

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-charcoal-950">Inventory</h1>
          <p className="font-sans text-sm text-charcoal-500 mt-1">{items.length} items tracked</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-outline flex items-center gap-2 py-2">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setEditItem(null)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-sans text-sm font-medium text-amber-800 mb-1">Low Stock Alert</p>
            <p className="font-sans text-xs text-amber-700">
              {lowStockItems.map(i => i.name).join(', ')} are running low.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Item', 'Unit', 'Total Stock', 'Used', 'Available', 'Alert Level', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs text-charcoal-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-stone-50">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 skeleton" /></td>
                  ))}
                </tr>
              )) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center font-sans text-sm text-charcoal-400">No inventory items</td></tr>
              ) : items.map(item => {
                const available = item.total_stock - item.total_used;
                const pct = item.total_stock > 0 ? (available / item.total_stock) * 100 : 0;
                return (
                  <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-sans text-sm font-medium text-charcoal-800">{item.name}</p>
                      {item.description && <p className="font-sans text-xs text-charcoal-400 truncate max-w-[200px]">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{item.unit}</td>
                    <td className="px-4 py-3 font-sans text-sm text-charcoal-700">{item.total_stock}</td>
                    <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{item.total_used}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct > 50 ? 'bg-emerald-400' : pct > 20 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-sans text-sm text-charcoal-700">{available}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-charcoal-600">{item.min_stock_alert}</td>
                    <td className="px-4 py-3">
                      {item.is_low_stock ? (
                        <span className="inline-flex items-center gap-1 font-sans text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5">
                          <AlertTriangle size={11} /> Low Stock
                        </span>
                      ) : (
                        <span className="font-sans text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditItem(item)} className="text-charcoal-400 hover:text-charcoal-700">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="text-charcoal-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editItem !== undefined && (
        <ItemModal item={editItem} onClose={() => setEditItem(undefined)} onSaved={fetchItems} />
      )}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4">
          <div className="bg-white p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-display text-xl text-charcoal-950 mb-2">Delete Item?</h3>
            <p className="font-sans text-sm text-charcoal-500 mb-6">This will permanently remove the inventory item.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-outline py-2">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white font-sans text-sm px-4 py-2 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
