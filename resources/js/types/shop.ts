export interface ShopCategory {
    id?: number;
    name: string;
    slug: string;
}

export interface ShopProduct {
    id: number;
    name: string;
    slug: string;
    description: string;
    specs: Record<string, string> | null;
    price: number;
    originalPrice: number | null;
    promoLabel: string | null;
    promoEndsAt: string | null;
    image: string | null;
    isFeatured: boolean;
    inStock: boolean;
    /** Null for made-to-order products, whose stock is not counted. */
    stock: number | null;
    category: ShopCategory;
}

export interface CartItem {
    productId: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    quantity: number;
}

export interface ShopOrderItem {
    productName: string;
    unitPrice: number;
    quantity: number;
}

export interface ShopOrder {
    reference: string;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    status: string;
    total: number;
    createdAt: string | null;
    items: ShopOrderItem[];
}

export function formatFcfa(amount: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
}
