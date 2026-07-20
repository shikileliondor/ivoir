import { cn } from '@/lib/utils';

/**
 * Logo flamme IvoirCuisson (placeholder vectoriel en attendant le
 * logo définitif fourni par le client).
 */
export function FlameLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 32" fill="none" className={cn('h-8 w-auto', className)} aria-hidden>
            <path
                d="M12 0c1.4 5.2 5.6 7.6 8.1 11.3 2.7 4 2.6 9.6-.4 13.4A11.9 11.9 0 0 1 12 29 11.9 11.9 0 0 1 4.3 24.7c-3-3.8-3.1-9.4-.4-13.4C6.4 7.6 10.6 5.2 12 0Z"
                fill="url(#flame-outer)"
            />
            <path
                d="M12 12c.8 2.9 3.1 4.2 4.5 6.3 1.5 2.2 1.4 5.3-.2 7.4A6.6 6.6 0 0 1 12 28a6.6 6.6 0 0 1-4.3-2.3c-1.6-2.1-1.7-5.2-.2-7.4C8.9 16.2 11.2 14.9 12 12Z"
                fill="url(#flame-inner)"
            />
            <defs>
                <linearGradient id="flame-outer" x1="12" y1="0" x2="12" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f97316" />
                    <stop offset="1" stopColor="#c2410c" />
                </linearGradient>
                <linearGradient id="flame-inner" x1="12" y1="12" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fde68a" />
                    <stop offset="1" stopColor="#fbbf24" />
                </linearGradient>
            </defs>
        </svg>
    );
}
