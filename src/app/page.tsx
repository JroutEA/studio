import { UnitFinder } from '@/components/unit-finder';
import fs from 'fs';
import path from 'path';

export default function Home() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const version = packageJson.version;

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
