import { CharacterFinder } from '@/components/character-finder';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 lg:py-12">
        <CharacterFinder />
      </main>
    </div>
  );
}
