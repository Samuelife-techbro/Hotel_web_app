export interface Room {
  id: number;
  name: string;
  room_number: string;
  category: 'standard' | 'deluxe' | 'suite' | 'presidential';
  description: string;
  price_per_night: string;
  capacity: number;
  floor: number;
  is_available: boolean;
  amenities: string[];
  display_image: string;
  image_url?: string;
  size_sqm: number;
  inventory_items?: RoomInventory[];
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  room: number;
  room_details: Room;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  status: BookingStatus;
  special_requests: string;
  total_price: string;
  booking_reference: string;
  duration_nights: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface BookingCreate {
  room: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  special_requests?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  unit: string;
  total_stock: number;
  min_stock_alert: number;
  is_low_stock: boolean;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface RoomInventory {
  id: number;
  room: number;
  item: number;
  item_name: string;
  item_unit: string;
  quantity_used: number;
  last_restocked: string | null;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'new_booking' | 'booking_cancelled' | 'low_stock' | 'system';
  is_read: boolean;
  related_booking: number | null;
  created_at: string;
}

export interface DashboardStats {
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  monthly_revenue: number;
  available_rooms: number;
  total_rooms: number;
  occupancy_rate: number;
  pending_bookings: number;
  unread_notifications: number;
  recent_bookings: Booking[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RoomFilters {
  category?: string;
  min_price?: string;
  max_price?: string;
  min_capacity?: string;
  is_available?: boolean;
  check_in?: string;
  check_out?: string;
}

export interface BookingStats {
  by_status: { status: string; count: number }[];
  by_room_type: { room__category: string; count: number; revenue: number }[];
  revenue_trend: { date: string; revenue: number }[];
}
