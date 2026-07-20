import { Link } from '@inertiajs/react';
import {
    BadgePercent,
    Globe,
    Image,
    LayoutGrid,
    MessagesSquare,
    Package,
    ShoppingCart,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { home } from '@/routes';
import { dashboard } from '@/routes/admin';
import categories from '@/routes/admin/categories';
import communication from '@/routes/admin/communication';
import orders from '@/routes/admin/orders';
import pricing from '@/routes/admin/pricing';
import products from '@/routes/admin/products';
import siteImages from '@/routes/admin/site-images';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Tableau de bord', href: dashboard(), icon: LayoutGrid },
    { title: 'Produits', href: products.index(), icon: Package },
    { title: 'Catégories', href: categories.index(), icon: Tags },
    { title: 'Commandes', href: orders.index(), icon: ShoppingCart },
    { title: 'Communication', href: communication.index(), icon: MessagesSquare },
    { title: 'Tarification', href: pricing.index(), icon: BadgePercent },
    { title: 'Images du site', href: siteImages.index(), icon: Image },
];

const footerNavItems: NavItem[] = [
    { title: 'Voir le site', href: home(), icon: Globe },
];

function AdminNav({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Gestion</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <AdminNav items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
