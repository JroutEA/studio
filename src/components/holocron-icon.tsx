import { cn } from '@/lib/utils';

export const HolocronIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('w-6 h-6 text-primary-foreground', className)}
        {...props}
    >
        <defs>
            <radialGradient id="holocron-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
            </radialGradient>
        </defs>
        
        {/* Glow Effect */}
        <path d="M12 2 L2 8 L12 14 L22 8 L12 2 Z" fill="url(#holocron-glow)" stroke="none" />

        {/* Main Pyramid Structure */}
        <path d="M12 2 L2 8 L12 14 L22 8 L12 2 Z" fill="#FFFFFF" fillOpacity="0.1" stroke="#FFFFFF" />
        <path d="M2 8 L2 16 L12 22 L12 14 Z" fill="#FFFFFF" fillOpacity="0.1" stroke="#FFFFFF" />
        <path d="M22 8 L22 16 L12 22 L12 14 Z" fill="#FFFFFF" fillOpacity="0.1" stroke="#FFFFFF" />

        {/* Etchings/Details */}
        <path d="M12 4.5 L7 8 L12 11.5 L17 8 L12 4.5 Z" stroke="#FFFFFF" strokeOpacity="0.7" />
        <path d="M4.5 9.5 L4.5 14.5 L12 18.5 L12 13.5 Z" stroke="#FFFFFF" strokeOpacity="0.7" />
        <path d="M19.5 9.5 L19.5 14.5 L12 18.5 L12 13.5 Z" stroke="#FFFFFF" strokeOpacity="0.7" />
        <circle cx="12" cy="8" r="0.5" fill="#FFFFFF" stroke="none" />
    </svg>
);
