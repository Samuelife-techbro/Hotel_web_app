import { format, parseISO, differenceInDays } from 'date-fns';
import { BookingStatus } from '../types';

export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date: string): string => {
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch {
    return date;
  }
};

export const formatDateTime = (date: string): string => {
  try {
    return format(parseISO(date), 'MMM d, yyyy HH:mm');
  } catch {
    return date;
  }
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  try {
    return differenceInDays(parseISO(checkOut), parseISO(checkIn));
  } catch {
    return 0;
  }
};

export const getStatusColor = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    checked_in: 'badge-checked_in',
    checked_out: 'badge-checked_out',
    cancelled: 'badge-cancelled',
  };
  return map[status] || 'badge';
};

export const getStatusLabel = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

export const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    standard: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Suite',
    presidential: 'Presidential',
  };
  return map[category] || category;
};

export const getCategoryBadgeColor = (category: string): string => {
  const map: Record<string, string> = {
    standard: 'bg-slate-100 text-slate-700',
    deluxe: 'bg-blue-50 text-blue-700',
    suite: 'bg-purple-50 text-purple-700',
    presidential: 'bg-gold-50 text-gold-700',
  };
  return map[category] || 'bg-gray-100 text-gray-700';
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
