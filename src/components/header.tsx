import { Swords } from 'lucide-react';

const SwordsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    suppressHydrationWarning
  >
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" x2="19" y1="19" y2="13" />
    <line x1="16" x2="20" y1="16" y2="20" />
    <line x1="19" x2="21" y1="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" x2="9" y1="14" y2="18" />
    <line x1="7" x2="4" y1="17" y2="20" />
    <line x1="3" x2="5" y1="19" y2="21" />
  </svg>
);


export function Header() {
  return (
    <header className="py-4 border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <SwordsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-headline">
            SWGOH Character Finder
          </h1>
        </div>
      </div>
    </header>
  );
}
