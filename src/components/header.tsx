import { Swords } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <Swords className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-headline">
            SWGOH Character Finder
          </h1>
        </div>
      </div>
    </header>
  );
}
