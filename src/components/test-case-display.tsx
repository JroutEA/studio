'use client';

import { useRef } from 'react';
import type { TestCaseAssistantAIOutput } from '@/ai/flows/test-case-assistant-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { SquadList } from './squad-list';
import { Button } from './ui/button';
import { useDownloadImage } from '@/hooks/use-download-image';

type TestCaseDisplayProps = {
  testCase: TestCaseAssistantAIOutput;
  triggerRef?: React.RefObject<HTMLButtonElement>;
};

export function TestCaseDisplay({ testCase, triggerRef }: TestCaseDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, `${testCase.scenarioTitle.replace(/ /g, '_')}`);

  return (
    <div ref={contentRef} className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">{testCase.scenarioTitle}</CardTitle>
              <CardDescription>{testCase.scenarioDescription}</CardDescription>
            </div>
            {/* The download button is now in the main component, but we can keep a placeholder if needed */}
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
