export interface AdminProductRow {
    id: number;
    name: string;
    slug: string;
    price: number;
    currentPrice: number;
    promoLabel: string | null;
    stock: number | null;
    image: string | null;
    isFeatured: boolean;
    isActive: boolean;
    category: string;
}

export interface AdminProductForm {
    id: number;
    slug: string;
    name: string;
    description: string;
    specs: Record<string, string> | null;
    price: number;
    stock: number | null;
    image: string | null;
    isFeatured: boolean;
    isActive: boolean;
    categoryId: number;
}

export interface AdminCategoryRow {
    id: number;
    name: string;
    slug: string;
    productsCount: number;
}

export interface AdminOrderRow {
    reference: string;
    customerName: string;
    customerPhone: string;
    city: string;
    status: string;
    total: number;
    itemsCount: number;
    createdAt: string | null;
}

export interface AdminOrderDetail {
    reference: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    address: string;
    city: string;
    status: string;
    total: number;
    createdAt: string | null;
    items: { productName: string; unitPrice: number; quantity: number }[];
}

export interface PricePeriodRow {
    id: number;
    label: string | null;
    price: number;
    startsAt: string;
    endsAt: string;
    status: 'active' | 'upcoming' | 'expired';
    product: { id: number; name: string; basePrice: number };
}

export interface ContactMessageRow {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    message: string;
    isRead: boolean;
    createdAt: string | null;
}

export interface NewsletterSubscriberRow {
    id: number;
    email: string;
    createdAt: string | null;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'paid',
    'delivered',
    'cancelled',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
};

export const ORDER_STATUS_CLASSES: Record<string, string> = {
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    delivered:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(iso));
}

export function formatDay(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(new Date(iso));
}
