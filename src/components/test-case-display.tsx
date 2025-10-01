'use client';

import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { TestCaseAssistantAIOutput } from '@/ai/flows/test-case-assistant-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { SquadList } from './squad-list';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Staatliches&display=swap";

type TestCaseDisplayProps = {
  testCase: TestCaseAssistantAIOutput;
};

export function TestCaseDisplay({ testCase }: TestCaseDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownloadImage = useCallback(async () => {
    if (ref.current === null) {
      return;
    }

    try {
      // Fetch the font CSS and pass it to the toPng function to avoid CORS issues.
      const fontResponse = await fetch(FONT_URL);
      const fontCss = await fontResponse.text();

      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2, // for HD quality
        backgroundColor: 'hsl(224 71% 4%)', // Using dark background HSL
        fontEmbedCSS: fontCss,
      });

      const link = document.createElement('a');
      link.download = `${testCase.scenarioTitle.replace(/ /g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download image', err);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate the image. Please try again.',
      });
    }
  }, [ref, testCase.scenarioTitle, toast]);


  return (
    <div ref={ref} className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">{testCase.scenarioTitle}</CardTitle>
              <CardDescription>{testCase.scenarioDescription}</CardDescription>
            </div>
            <Button onClick={handleDownloadImage} size="icon" variant="outline" className="shrink-0">
              <Download className="w-4 h-4" />
              <span className="sr-only">Download as Image</span>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <SquadList squads={[testCase.alliedSquad]} title="Allied Squad" />
      <SquadList squads={[testCase.opponentSquad]} title="Opponent Squad" />

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {testCase.setupInstructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-green-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" />
                    Pass Criteria
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{testCase.passCriteria}</p>
            </CardContent>
        </Card>
         <Card className="border-red-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <XCircle className="text-red-500" />
                    Fail Criteria
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{testCase.failCriteria}</p>
            </CardContent>
        </Card>
      </div>

      {testCase.notApplicableCriteria && (
        <Card className="border-yellow-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="text-yellow-500" />
                    Not Applicable Criteria
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{testCase.notApplicableCriteria}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
