import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from './ui/card';

export function SquadListSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-start gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="text-center">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-16 mt-2 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
