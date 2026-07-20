import { createContext, useCallback, useContext, useEffect, useMemo, useState  } from 'react';
import type {ReactNode} from 'react';
import type { CartItem, ShopProduct } from '@/types/shop';

const STORAGE_KEY = 'ivoircuisson-cart';
const MAX_QUANTITY = 50;

interface CartContextValue {
    items: CartItem[];
    count: number;
    total: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: ShopProduct, quantity?: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (item): item is CartItem =>
                typeof item === 'object' &&
                item !== null &&
                typeof (item as CartItem).productId === 'number' &&
                typeof (item as CartItem).quantity === 'number' &&
                (item as CartItem).quantity > 0,
        );
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(readStoredCart);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: ShopProduct, quantity = 1) => {
        setItems((current) => {
            const existing = current.find((item) => item.productId === product.id);

            if (existing) {
                return current.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
                        : item,
                );
            }

            return [
                ...current,
                {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: product.image,
                    quantity: Math.min(MAX_QUANTITY, quantity),
                },
            ];
        });
        setIsOpen(true);
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        setItems((current) =>
            quantity <= 0
                ? current.filter((item) => item.productId !== productId)
                : current.map((item) =>
                      item.productId === productId ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item,
                  ),
        );
    }, []);

    const removeItem = useCallback((productId: number) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            count: items.reduce((sum, item) => sum + item.quantity, 0),
            total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            isOpen,
            openCart,
            closeCart,
            addItem,
            updateQuantity,
            removeItem,
            clearCart,
        }),
        [items, isOpen, openCart, closeCart, addItem, updateQuantity, removeItem, clearCart],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart doit être utilisé dans un CartProvider');
    }

    return context;
}
