
'use client';

import { useRef } from 'react';
import type { TestCaseAssistantAIOutput } from '@/ai/flows/test-case-assistant-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Terminal, Users, AlertTriangle } from 'lucide-react';
import { useDownloadImage } from '@/hooks/use-download-image';

type TestCaseDisplayProps = {
  testCase: TestCaseAssistantAIOutput;
  triggerRef?: React.RefObject<HTMLButtonElement>;
};

type Squad = TestCaseAssistantAIOutput['alliedSquad'];

const SimpleSquadList = ({ squad, title }: { squad: Squad; title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-test-assistant-accent" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-1">
                 <p className="font-semibold">{squad.leader.name} <span className="text-sm text-muted-foreground font-normal">(Leader)</span></p>
                 <div className="pl-6 space-y-1 text-muted-foreground">
                    {squad.members.map((member, index) => (
                        <p key={index}>{member.name}</p>
                    ))}
                 </div>
            </div>
        </CardContent>
    </Card>
);


export function TestCaseDisplay({ testCase, triggerRef }: TestCaseDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, `${testCase.scenarioTitle.replace(/ /g, '_')}`);

  return (
    <div ref={contentRef} className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
      
      <div className="flex items-start gap-3 rounded-lg border border-test-assistant-accent/20 bg-card p-4">
          <Terminal className="h-5 w-5 flex-shrink-0 text-test-assistant-accent" />
          <div className="flex-1">
              <p className="text-sm font-semibold text-test-assistant-accent">Test Scenario</p>
              <p className="text-muted-foreground italic">"{testCase.scenarioTitle}"</p>
          </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Scenario Overview</CardTitle>
          <CardDescription>{testCase.scenarioDescription}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-4">
        <SimpleSquadList squad={testCase.alliedSquad} title="Allied Squad" />
        <SimpleSquadList squad={testCase.opponentSquad} title="Opponent Squad" />
      </div>

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
      
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>This result is AI-generated and may make mistakes.</span>
      </div>
    </div>
  );
}
