'use client';

const GalacticEmpireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      suppressHydrationWarning
    >
      <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 4.75c-4.01 0-7.25 3.24-7.25 7.25S7.99 19.25 12 19.25s7.25-3.24 7.25-7.25S16.01 4.75 12 4.75zm0 1.5c3.18 0 5.75 2.57 5.75 5.75s-2.57 5.75-5.75 5.75-5.75-2.57-5.75-5.75S8.82 6.25 12 6.25z" />
      <path d="M12 9.25c-1.52 0-2.75 1.23-2.75 2.75s1.23 2.75 2.75 2.75 2.75-1.23 2.75-2.75-1.23-2.75-2.75-2.75zm-3 5.34l-1.42 1.42c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41l1.41-1.41 1.42 1.4zM16.42 9.17l1.41-1.41c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-1.42 1.42 1.42 1.4zM4.77 9.17l1.42 1.41-1.42 1.42-1.41-1.41c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0zM19.23 14.83l-1.42-1.42 1.42-1.41 1.41 1.41c.39.39.39 1.02 0 1.41s-1.03.39-1.41 0zM12 3.5l1.5 3h-3L12 3.5zM8.5 19.09l1.5-3h3l-1.5 3h-3zM3.91 8.5h3l-1.5-3-1.5 3zM16.59 15.5h3l-1.5 3-1.5-3z" />
    </svg>
  );


export function Header() {
  return (
    <header className="py-4 border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <GalacticEmpireIcon className="w-6 h-6" suppressHydrationWarning />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-headline">
            SWGOH AI Assistant
          </h1>
        </div>
      </div>
    </header>
  );
}
