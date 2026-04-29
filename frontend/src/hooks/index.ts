import { useState, useEffect, useCallback, useRef } from 'react';
import { roomsApi, bookingsApi, inventoryApi, dashboardApi } from '../services/api';
import type { Room, Booking, InventoryItem, DashboardStats, RoomFilters } from '../types';

// Generic async hook
function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ---- Rooms ----
export function useRooms(filters?: RoomFilters) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.min_price) params.min_price = filters.min_price;
      if (filters?.max_price) params.max_price = filters.max_price;
      if (filters?.min_capacity) params.min_capacity = filters.min_capacity;

      if (filters?.check_in && filters?.check_out) {
        const res = await roomsApi.available({
          ...params,
          check_in: filters.check_in,
          check_out: filters.check_out,
        });
        setRooms(res.data);
      } else {
        const res = await roomsApi.list(params);
        setRooms(res.data.results ?? res.data);
      }
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  return { rooms, loading, refetch: fetchRooms };
}

export function useRoom(id: number | undefined) {
  return useAsync<Room>(
    () => roomsApi.get(id!).then(r => r.data),
    [id]
  );
}

// ---- Bookings ----
export function useBookings(params?: Record<string, string>) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.list(params);
      setBookings(res.data.results ?? res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return { bookings, loading, refetch: fetchBookings };
}

// ---- Inventory ----
export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listItems();
      setItems(res.data.results ?? res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return { items, loading, refetch: fetchItems };
}

// ---- Dashboard ----
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ---- Debounce ----
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---- Local storage ----
export function useLocalStorage<T>(key: string, initial: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = (value: T) => {
    try {
      setStored(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
  };

  return [stored, setValue] as const;
}

// ---- Pagination ----
export function usePagination(total: number, pageSize = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    totalPages,
    setPage,
    canPrev: page > 1,
    canNext: page < totalPages,
    prev: () => setPage(p => Math.max(1, p - 1)),
    next: () => setPage(p => Math.min(totalPages, p + 1)),
  };
}

// ---- Click outside ----
export function useClickOutside(handler: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [handler]);
  return ref;
}
