import { cn } from '@/lib/utils';

export const HolocronIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('w-6 h-6', className)}
    {...props}
  >
    <path d="M12 2c-3.39 0-6.17 2.76-6.45 6.13-.07.82.25 1.6.83 2.17l.79.79c.4.4.82.78 1.25 1.15l-1.42 1.42C5.45 15.21 4.5 17.5 4.5 20v2h15v-2c0-2.5-1-4.79-2.5-6.34l-1.42-1.42c.43-.37.85-.75 1.25-1.15l.79-.79c.58-.57.9-1.35.83-2.17C18.17 4.76 15.39 2 12 2zm-3 7c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1zm1 2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1z"/>
  </svg>
);
