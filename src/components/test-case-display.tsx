'use client';

import { useRef } from 'react';
import type { TestCaseAssistantAIOutput } from '@/ai/flows/test-case-assistant-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, AlertCircle, Terminal, Users } from 'lucide-react';
import { useDownloadImage } from '@/hooks/use-download-image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


type TestCaseDisplayProps = {
  testCase: TestCaseAssistantAIOutput;
  triggerRef?: React.RefObject<HTMLButtonElement>;
};

type Squad = TestCaseAssistantAIOutput['alliedSquad'];

const SimpleSquadList = ({ squad, title }: { squad: Squad; title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                 <p className="font-semibold">{squad.leader.name} (Leader)</p>
                 <ul className="list-disc list-inside pl-2 space-y-1 text-muted-foreground">
                    {squad.members.map((member, index) => (
                        <li key={index}>
                            <Link href={member.url} target="_blank" className="hover:underline hover:text-primary">
                                {member.name}
                            </Link>
                        </li>
                    ))}
                 </ul>
            </div>
        </CardContent>
    </Card>
);


export function TestCaseDisplay({ testCase, triggerRef }: TestCaseDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, `${testCase.scenarioTitle.replace(/ /g, '_')}`);

  return (
    <div ref={contentRef} className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
      
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-card p-4">
          <Terminal className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Test Scenario</p>
              <p className="text-muted-foreground italic">"{testCase.scenarioTitle}"</p>
          </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Scenario Overview</CardTitle>
          <CardDescription>{testCase.scenarioDescription}</CardDescription>
        </CardHeader>
      </Card>
      
      <SimpleSquadList squad={testCase.alliedSquad} title="Allied Squad" />
      <SimpleSquadList squad={testCase.opponentSquad} title="Opponent Squad" />

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
