import { UnitFinder } from '@/components/unit-finder';

export default function Home() {
  const version = '1.1.1';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto py-8 lg:py-12">
        <UnitFinder />
      </main>
      <footer className="py-4">
        <p className="text-center text-xs text-muted-foreground">
          v{version}
        </p>
      </footer>
    </div>
  );
}
