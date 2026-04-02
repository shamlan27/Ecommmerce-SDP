export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-amber-100 text-amber-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800',
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

function getStorageBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const trimmed = apiUrl.trim().replace(/\/+$/, '');
  const origin = trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
  return `${origin}/storage`;
}

export function getImageUrl(path: string | undefined): string {
  if (!path) return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400';

  const storageBase = getStorageBaseUrl();

  if (/^https?:\/\/localhost:8000\//i.test(path)) {
    return path.replace(/^https?:\/\/localhost:8000\//i, `${storageBase.replace(/\/storage$/, '')}/`);
  }

  if (/^https?:\/\//i.test(path)) return path;

  if (path.startsWith('/storage/')) {
    return `${storageBase}/${path.replace(/^\/storage\//, '')}`;
  }

  if (path.startsWith('storage/')) {
    return `${storageBase}/${path.replace(/^storage\//, '')}`;
  }

  return `${storageBase}/${path}`;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateDiscount(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
