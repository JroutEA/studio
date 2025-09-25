import { UnitFinder } from '@/components/unit-finder';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto py-8 lg:py-12">
        <UnitFinder />
      </main>
    </div>
  );
}
