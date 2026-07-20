import { WHATSAPP_URL, WhatsAppIcon } from '@/components/shop/whatsapp-icon';

export function WhatsAppButton() {
    return (
        <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Discuter sur WhatsApp"
            className="fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110"
        >
            <WhatsAppIcon className="size-7" />
        </a>
    );
}
