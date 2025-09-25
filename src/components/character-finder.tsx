'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { findCharacters, buildSquad, generateTestCase, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, LoaderCircle, History, Users, TestTube } from 'lucide-react';
import { CharacterList } from './character-list';
import { CharacterListSkeleton } from './character-list-skeleton';
import { SquadList } from './squad-list';
import { SquadListSkeleton } from './squad-list-skeleton';
import { TestCaseDisplay } from './test-case-display';

const initialState: FormState = {
  message: '',
};

const CHARACTER_HISTORY_KEY = 'swgoh_character_query_history';
const SQUAD_HISTORY_KEY = 'swgoh_squad_query_history';
const TEST_CASE_HISTORY_KEY = 'swgoh_test_case_history';


function SubmitButton({ icon, pendingText, text }: { icon: React.ReactNode, pendingText: string, text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </Button>
  );
}


export function CharacterFinder() {
  const [characterState, characterFormAction] = useActionState(findCharacters, initialState);
  const [squadState, squadFormAction] = useActionState(buildSquad, initialState);
  const [testCaseState, testCaseFormAction] = useActionState(generateTestCase, initialState);
  
  const { pending } = useFormStatus();
  const { toast } = useToast();
  
  const [characterHistory, setCharacterHistory] = useState<string[]>([]);
  const [squadHistory, setSquadHistory] = useState<string[]>([]);
  const [testCaseHistory, setTestCaseHistory] = useState<any[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const characterFormRef = useRef<HTMLFormElement>(null);
  const squadFormRef = useRef<HTMLFormElement>(null);
  const testCaseFormRef = useRef<HTMLFormElement>(null);

  const characterTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const squadTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const testCaseAbilityRef = useRef<HTMLTextAreaElement>(null);
  const testCaseUnitRef = useRef<HTMLTextAreaElement>(null);
  const testCaseExpectedRef = useRef<HTMLTextAreaElement>(null);


  const [activeTab, setActiveTab] = useState('character-finder');
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const state = activeTab === 'character-finder' ? characterState :
                activeTab === 'squad-builder' ? squadState :
                testCaseState;
  
  const history = activeTab === 'character-finder' ? characterHistory :
                  activeTab === 'squad-builder' ? squadHistory :
                  testCaseHistory;

  useEffect(() => {
    try {
      const storedCharacterHistory = localStorage.getItem(CHARACTER_HISTORY_KEY);
      if (storedCharacterHistory) setCharacterHistory(JSON.parse(storedCharacterHistory));

      const storedSquadHistory = localStorage.getItem(SQUAD_HISTORY_KEY);
      if (storedSquadHistory) setSquadHistory(JSON.parse(storedSquadHistory));

      const storedTestCaseHistory = localStorage.getItem(TEST_CASE_HISTORY_KEY);
      if (storedTestCaseHistory) setTestCaseHistory(JSON.parse(storedTestCaseHistory));

    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: state.message });
    }
    
    if (activeTab === 'character-finder' && characterState.message === 'success' && characterState.query) {
       setCharacterHistory(prevHistory => {
        if (!prevHistory.includes(characterState.query!)) {
          const newHistory = [characterState.query!, ...prevHistory].slice(0, 20);
          localStorage.setItem(CHARACTER_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prevHistory;
      });
    } else if (activeTab === 'squad-builder' && squadState.message === 'success' && squadState.query) {
       setSquadHistory(prevHistory => {
        if (!prevHistory.includes(squadState.query!)) {
          const newHistory = [squadState.query!, ...prevHistory].slice(0, 20);
          localStorage.setItem(SQUAD_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prevHistory;
      });
    } else if (activeTab === 'test-assistant' && testCaseState.message === 'success' && testCaseState.testCaseInput) {
       setTestCaseHistory(prevHistory => {
         const newHistoryJSON = JSON.stringify(testCaseState.testCaseInput);
         if (!prevHistory.find(h => JSON.stringify(h) === newHistoryJSON)) {
           const newHistory = [testCaseState.testCaseInput!, ...prevHistory].slice(0, 20);
           localStorage.setItem(TEST_CASE_HISTORY_KEY, JSON.stringify(newHistory));
           return newHistory;
         }
         return prevHistory;
       });
    }
  }, [characterState, squadState, testCaseState, activeTab, toast]);

  const handleHistoryClick = (query: any) => {
    if (activeTab === 'character-finder' && characterTextAreaRef.current) {
      characterTextAreaRef.current.value = query;
    } else if (activeTab === 'squad-builder' && squadTextAreaRef.current) {
      squadTextAreaRef.current.value = query;
    } else if (activeTab === 'test-assistant' && testCaseAbilityRef.current && testCaseUnitRef.current && testCaseExpectedRef.current) {
        testCaseAbilityRef.current.value = query.testCase;
        testCaseUnitRef.current.value = query.unitDetails;
        testCaseExpectedRef.current.value = query.expectedResult;
    }
    setIsHistoryOpen(false);
  };
  
  return (
    <div className="space-y-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                  <Box className="w-6 h-6" suppressHydrationWarning />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">The AI Holocron</CardTitle>
                <CardDescription>
                  Your AI assistant for SWGOH QA and testing
                </CardDescription>
              </div>
            </div>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" suppressHydrationWarning />
                  <span className="sr-only">View query history</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Query History</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {history.length > 0 ? (
                    history.map((query, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                        onClick={() => handleHistoryClick(query)}
                      >
                        {typeof query === 'string' ? query : query.testCase}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your past queries will appear here.
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {isClient ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" suppressHydrationWarning>
              <TabsList className="grid w-full grid-cols-3" suppressHydrationWarning>
                <TabsTrigger value="character-finder">Character Finder</TabsTrigger>
                <TabsTrigger value="squad-builder">Squad Builder</TabsTrigger>
                <TabsTrigger value="test-assistant">Test Assistant</TabsTrigger>
              </TabsList>

              <TabsContent value="character-finder" className="mt-4">
                 <form action={characterFormAction} ref={characterFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="character-query">Your Query</Label>
                    <Textarea id="character-query" name="query" ref={characterTextAreaRef} placeholder="e.g., 'A Jedi tank that can counterattack and has high health.'" required rows={3} className="text-base" />
                  </div>
                  <SubmitButton icon={<Box className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Searching..." text="Find Characters" />
                </form>
              </TabsContent>
              
              <TabsContent value="squad-builder" className="mt-4">
                <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="squad-query">Your Query</Label>
                    <Textarea id="squad-query" name="query" ref={squadTextAreaRef} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                  </div>
                  <SubmitButton icon={<Users className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Building..." text="Build Squad" />
                </form>
              </TabsContent>

              <TabsContent value="test-assistant" className="mt-4">
                <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="test-case">Ability / Test Case</Label>
                    <Textarea id="test-case" name="testCase" ref={testCaseAbilityRef} placeholder="e.g., 'Test if the new unit's 'Force Shield' ability correctly dispels all debuffs.'" required rows={2} className="text-base" />
                  </div>
                   <div className="grid w-full gap-1.5">
                    <Label htmlFor="expected-result">Expected Result</Label>
                    <Textarea id="expected-result" name="expectedResult" ref={testCaseExpectedRef} placeholder="e.g., 'All debuffs on the new unit should be cleared, and it should gain the 'Protection Up' buff.'" required rows={2} className="text-base" />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="unit-details">New Unit Details</Label>
                     <p className="text-xs text-muted-foreground">
                      To protect IP, please avoid mentioning the new unit's name. Refer to it as "new unit". You can copy and paste the ability details from the master ticket.
                    </p>
                    <Textarea id="unit-details" name="unitDetails" ref={testCaseUnitRef} placeholder="Describe the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons." required rows={4} className="text-base" />
                  </div>
                   <SubmitButton icon={<TestTube className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Generating..." text="Generate Test Case" />
                </form>
              </TabsContent>

            </Tabs>
          ) : (
             <div className="space-y-4 mt-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="character-query">Your Query</Label>
                  <Textarea id="character-query" name="query" placeholder="e.g., 'A Jedi tank that can counterattack and has high health.'" required rows={3} className="text-base" />
                </div>
                <Button className="w-full sm:w-auto">
                  <Box className="mr-2 h-4 w-4" suppressHydrationWarning />
                  Find Characters
                </Button>
             </div>
          )}
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {pending && activeTab === 'character-finder' && <CharacterListSkeleton />}
        {pending && activeTab === 'squad-builder' && <SquadListSkeleton />}
        {pending && activeTab === 'test-assistant' && <SquadListSkeleton />}


        {!pending && activeTab === 'character-finder' && characterState.characters && characterState.characters.length > 0 && (
          <CharacterList characters={characterState.characters} />
        )}

        {!pending && activeTab === 'squad-builder' && squadState.squads && squadState.squads.length > 0 && (
          <SquadList squads={squadState.squads} />
        )}

        {!pending && activeTab === 'test-assistant' && testCaseState.testCase && (
          <TestCaseDisplay testCase={testCaseState.testCase} />
        )}


        {!pending && isClient && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            {activeTab === 'character-finder' && (!characterState.characters || characterState.characters.length === 0) &&
              <>
                <Box className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold">Your matched characters will appear here</h3>
                <p>Enter a description above to get started.</p>
              </>
            }
            {activeTab === 'squad-builder' && (!squadState.squads || squadState.squads.length === 0) &&
              <>
                <Users className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold">Your generated squads will appear here</h3>
                <p>Describe the squad you want to build above.</p>
              </>
            }
            {activeTab === 'test-assistant' && !testCaseState.testCase &&
              <>
                <TestTube className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold">Your generated test case will appear here</h3>
                <p>Describe the scenario you want to test above.</p>
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
}
