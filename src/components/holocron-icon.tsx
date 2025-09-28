import { cn } from '@/lib/utils';

export const HolocronIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('w-6 h-6', className)}
    {...props}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="2" y1="9.27" x2="22" y2="9.27"></line>
    <line x1="5.82" y1="22" x2="18.18" y2="2"></line>
    <line x1="5.82" y1="2" x2="18.18" y2="22"></line>
  </svg>
);
