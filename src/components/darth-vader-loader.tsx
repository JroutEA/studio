
'use client';

import { cn } from '@/lib/utils';

export const DarthVaderLoader = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('animate-pulse-vader', className)}
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".1"/>
    <path d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.29 12.88l-1.42-1.42c-.38-.38-.89-.59-1.42-.59H13v-2.45h-2V15H8.55c-.53 0-1.04.21-1.42.59l-1.42 1.42C5.33 16.29 5 16.88 5 17.5V18h14v-.5c0-.62-.33-1.21-.71-1.62zM12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6z"/>
    <path d="M12 7.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);
