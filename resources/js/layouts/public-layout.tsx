import type {ReactNode} from 'react';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { CartProvider } from '@/components/shop/cart-provider';
import { SiteFooter } from '@/components/shop/site-footer';
import { SiteHeader } from '@/components/shop/site-header';
import { Welcome3dModal } from '@/components/shop/welcome-3d-modal';
import { WhatsAppButton } from '@/components/shop/whatsapp-button';
import { useLenis } from '@/hooks/use-lenis';

export default function PublicLayout({ children }: { children: ReactNode }) {
    useLenis();

    return (
        <CartProvider>
            <div className="shop-root flex min-h-screen flex-col font-sans antialiased">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <WhatsAppButton />
                <CartDrawer />
                <Welcome3dModal />
            </div>
        </CartProvider>
    );
}
