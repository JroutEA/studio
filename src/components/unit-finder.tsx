'use client';

import { useActionState, useEffect, useState, useRef, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { findUnits, buildSquad, generateTestCase, type FormState } from '@/app/actions';
import type { SquadBuilderAIOutput } from '@/ai/flows/squad-builder-ai';
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
import { History, Users, TestTube, Trash2, Star } from 'lucide-react';
import { UnitList } from './unit-list';
import { UnitListSkeleton } from './unit-list-skeleton';
import { SquadList } from './squad-list';
import { SquadListSkeleton } from './squad-list-skeleton';
import { TestCaseDisplay } from './test-case-display';
import { HolocronIcon } from './holocron-icon';
import { DarthVaderLoader } from './darth-vader-loader';

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];
const initialState: FormState = {
  message: '',
};

const UNIT_HISTORY_KEY = 'swgoh_unit_query_history';
const SQUAD_HISTORY_KEY = 'swgoh_squad_query_history';
const TEST_CASE_HISTORY_KEY = 'swgoh_test_case_history';
const SAVED_SQUADS_KEY = 'swgoh_saved_squads';


function SubmitButton({ icon, pendingText, text }: { icon: React.ReactNode, pendingText: string, text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <DarthVaderLoader className="mr-2 h-4 w-4" />
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


export function UnitFinder() {
  const [unitState, unitFormAction, isUnitFormPending] = useActionState(findUnits, initialState);
  const [squadState, squadFormAction, isSquadFormPending] = useActionState(buildSquad, initialState);
  const [testCaseState, testCaseFormAction, isTestCaseFormPending] = useActionState(generateTestCase, initialState);
  
  const { pending } = useFormStatus();
  const { toast } = useToast();
  
  const [unitHistory, setUnitHistory] = useState<string[]>([]);
  const [squadHistory, setSquadHistory] = useState<string[]>([]);
  const [testCaseHistory, setTestCaseHistory] = useState<any[]>([]);
  const [savedSquads, setSavedSquads] = useState<Squad[]>([]);
  
  const [previousUnitCount, setPreviousUnitCount] = useState(0);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedSquadsOpen, setIsSavedSquadsOpen] = useState(false);
  
  const unitFormRef = useRef<HTMLFormElement>(null);
  const squadFormRef = useRef<HTMLFormElement>(null);
  const testCaseFormRef = useRef<HTMLFormElement>(null);

  const unitTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const squadTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const testCaseAbilityRef = useRef<HTMLTextAreaElement>(null);
  const testCaseUnitRef = useRef<HTMLTextAreaElement>(null);
  const testCaseExpectedRef = useRef<HTMLTextAreaElement>(null);


  const [activeTab, setActiveTab] = useState('unit-finder');
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUnitHistory = localStorage.getItem(UNIT_HISTORY_KEY);
      if (storedUnitHistory) setUnitHistory(JSON.parse(storedUnitHistory));

      const storedSquadHistory = localStorage.getItem(SQUAD_HISTORY_KEY);
      if (storedSquadHistory) setSquadHistory(JSON.parse(storedSquadHistory));

      const storedTestCaseHistory = localStorage.getItem(TEST_CASE_HISTORY_KEY);
      if (storedTestCaseHistory) setTestCaseHistory(JSON.parse(storedTestCaseHistory));

      const storedSavedSquads = localStorage.getItem(SAVED_SQUADS_KEY);
      if (storedSavedSquads) setSavedSquads(JSON.parse(storedSavedSquads));

    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
    }
  }, []);

  const handleToggleSaveSquad = (squad: Squad) => {
    setSavedSquads(prevSavedSquads => {
      const isSaved = prevSavedSquads.some(saved => saved.name === squad.name && saved.leader.name === squad.leader.name);
      let newSavedSquads;
      if (isSaved) {
        newSavedSquads = prevSavedSquads.filter(saved => saved.name !== squad.name || saved.leader.name !== squad.leader.name);
        toast({ title: "Squad Unsaved", description: `"${squad.name}" has been removed from your saved squads.` });
      } else {
        newSavedSquads = [...prevSavedSquads, squad];
        toast({ title: "Squad Saved!", description: `"${squad.name}" has been added to your saved squads.` });
      }
      localStorage.setItem(SAVED_SQUADS_KEY, JSON.stringify(newSavedSquads));
      return newSavedSquads;
    });
  };
  
  const handleLoadMoreUnits = () => {
    if (unitState.query) {
      const newCount = (unitState.units?.length || 0) + 5;
      setPreviousUnitCount(unitState.units?.length || 0);
      
      const formData = new FormData(unitFormRef.current!);
      formData.set('count', newCount.toString());
      
      startTransition(() => {
        unitFormAction(formData);
      });
    }
  };

  const handleLoadMoreSquads = () => {
    if (squadState.squadsInput?.query) {
      const newCount = (squadState.squads?.length || 0) + 3;
      
      const formData = new FormData(squadFormRef.current!);
      formData.set('count', newCount.toString());

      startTransition(() => {
        squadFormAction(formData);
      });
    }
  };

  useEffect(() => {
    const currentState = 
        activeTab === 'unit-finder' ? unitState :
        activeTab === 'squad-builder' ? squadState :
        testCaseState;

    if (currentState.message && currentState.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: currentState.message });
    }

    if (isUnitFormPending || isSquadFormPending || isTestCaseFormPending) return;
    
    if (activeTab === 'unit-finder' && unitState.message === 'success' && unitState.query) {
       setUnitHistory(prevHistory => {
        if (!prevHistory.includes(unitState.query!)) {
          const newHistory = [unitState.query!, ...prevHistory].slice(0, 20);
          localStorage.setItem(UNIT_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prevHistory;
      });
    } else if (activeTab === 'squad-builder' && squadState.message === 'success' && squadState.squadsInput?.query) {
       setSquadHistory(prevHistory => {
        if (!prevHistory.includes(squadState.squadsInput!.query)) {
          const newHistory = [squadState.squadsInput!.query, ...prevHistory].slice(0, 20);
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
  }, [unitState, squadState, testCaseState, activeTab, isUnitFormPending, isSquadFormPending, isTestCaseFormPending, toast]);

  const handleHistoryClick = (query: any) => {
    if (activeTab === 'unit-finder' && unitTextAreaRef.current) {
      unitTextAreaRef.current.value = query;
    } else if (activeTab === 'squad-builder' && squadTextAreaRef.current) {
      squadTextAreaRef.current.value = query;
    } else if (activeTab === 'test-assistant' && testCaseAbilityRef.current && testCaseUnitRef.current && testCaseExpectedRef.current) {
        testCaseAbilityRef.current.value = query.testCase;
        testCaseUnitRef.current.value = query.unitDetails;
        testCaseExpectedRef.current.value = query.expectedResult;
    }
    setIsHistoryOpen(false);
  };
  
  const handleDeleteHistoryItem = (index: number) => {
    let updatedHistory;
    let storageKey;

    if (activeTab === 'unit-finder') {
        updatedHistory = [...unitHistory];
        storageKey = UNIT_HISTORY_KEY;
        updatedHistory.splice(index, 1);
        setUnitHistory(updatedHistory);
    } else if (activeTab === 'squad-builder') {
        updatedHistory = [...squadHistory];
        storageKey = SQUAD_HISTORY_KEY;
        updatedHistory.splice(index, 1);
        setSquadHistory(updatedHistory);
    } else if (activeTab === 'test-assistant') {
        updatedHistory = [...testCaseHistory];
        storageKey = TEST_CASE_HISTORY_KEY;
        updatedHistory.splice(index, 1);
        setTestCaseHistory(updatedHistory);
    } else {
      return;
    }

    if (isClient) {
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (activeTab === 'unit-finder' && unitFormRef.current) {
        unitFormRef.current.requestSubmit();
      } else if (activeTab === 'squad-builder' && squadFormRef.current) {
        squadFormRef.current.requestSubmit();
      } else if (activeTab === 'test-assistant' && testCaseFormRef.current) {
        testCaseFormRef.current.requestSubmit();
      }
    }
  };
  
  const handleUnitFormSubmit = (formData: FormData) => {
    setPreviousUnitCount(0);
    unitFormAction(formData);
  }

  const renderUnitFinderContent = () => {
    const hasResults = unitState.units && unitState.units.length > 0;
    const isLoadingFirstTime = isUnitFormPending && !hasResults;
    
    if (isLoadingFirstTime) {
      return <UnitListSkeleton />;
    }

    if (hasResults) {
      return (
        <div className="space-y-4">
          <UnitList 
            units={unitState.units!} 
            isLoadingMore={isUnitFormPending && (unitState.units?.length || 0) > 0}
            previousCount={previousUnitCount} 
          />
          <div className="text-center">
            <Button onClick={handleLoadMoreUnits} disabled={isUnitFormPending}>
              {isUnitFormPending ? (
                <>
                  <DarthVaderLoader className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                'Load 5 More'
              )}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-primary/20">
        <HolocronIcon className="mx-auto h-12 w-12" />
        <h3 className="text-lg font-semibold mt-2">Your matched units will appear here</h3>
        <p>Enter a description above to get started.</p>
      </div>
    );
  };
  
  const renderSquadBuilderContent = () => {
    const hasResults = squadState.squads && squadState.squads.length > 0;
    const isLoadingFirstTime = isSquadFormPending && !hasResults;
    
    if (isLoadingFirstTime) {
      return <SquadListSkeleton />;
    }

    if (hasResults) {
      return (
        <div className="space-y-4">
          <SquadList 
            squads={squadState.squads!} 
            isLoadingMore={isSquadFormPending && (squadState.squads?.length || 0) > 0}
            savedSquads={savedSquads}
            onToggleSave={handleToggleSaveSquad}
          />
          <div className="text-center">
            <Button onClick={handleLoadMoreSquads} disabled={isSquadFormPending}>
              {isSquadFormPending ? (
                <>
                  <DarthVaderLoader className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                'Load 3 More'
              )}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-primary/20">
        <Users className="mx-auto h-12 w-12" />
        <h3 className="text-lg font-semibold mt-2">Your generated squads will appear here</h3>
        <p>Describe the squad you want to build above.</p>
      </div>
    );
  };

  const renderTestAssistantContent = () => {
    if (isTestCaseFormPending) {
      return <SquadListSkeleton />;
    }

    if (testCaseState.testCase) {
      return <TestCaseDisplay testCase={testCaseState.testCase} />;
    }
    
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-primary/20">
        <TestTube className="mx-auto h-12 w-12" />
        <h3 className="text-lg font-semibold mt-2">Your generated test case will appear here</h3>
        <p>Describe the scenario you want to test above.</p>
      </div>
    );
  };


  return (
    <div className="space-y-12">
      <Card className="max-w-3xl mx-auto shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                  <HolocronIcon className="w-6 h-6" suppressHydrationWarning />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">The AI Holocron</CardTitle>
                <CardDescription>
                  This IS the droid you're looking for... to test your units.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'squad-builder' && (
                <Sheet open={isSavedSquadsOpen} onOpenChange={setIsSavedSquadsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Star className="h-4 w-4" suppressHydrationWarning />
                      <span className="sr-only">View saved squads</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Saved Squads</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      {isClient && savedSquads.length > 0 ? (
                        <SquadList squads={savedSquads} onToggleSave={handleToggleSaveSquad} savedSquads={savedSquads} />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Your saved squads will appear here. Click the star on a squad to save it.
                        </p>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
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
                    {isClient && (activeTab === 'unit-finder' ? unitHistory : activeTab === 'squad-builder' ? squadHistory : testCaseHistory).length > 0 ? (
                      (activeTab === 'unit-finder' ? unitHistory : activeTab === 'squad-builder' ? squadHistory : testCaseHistory).map((query, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent group">
                          <div
                              className="flex-grow cursor-pointer text-sm group-hover:text-accent-foreground"
                              onClick={() => handleHistoryClick(query)}
                          >
                              {typeof query === 'string' ? query : query.testCase}
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground group-hover:text-accent-foreground"
                              onClick={() => handleDeleteHistoryItem(index)}
                          >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete query</span>
                          </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unit-finder">Unit Finder</TabsTrigger>
              <TabsTrigger value="squad-builder">Squad Builder</TabsTrigger>
              <TabsTrigger value="test-assistant">Test Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="unit-finder" className="mt-4">
               <form action={handleUnitFormSubmit} ref={unitFormRef} className="space-y-4">
                 <input type="hidden" name="count" value="10" />
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="unit-query" name="query" ref={unitTextAreaRef} defaultValue={unitState.query} placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                </div>
                <SubmitButton icon={<HolocronIcon className="mr-2 h-4 w-4" />} pendingText="Searching..." text="Find Units" />
              </form>
            </TabsContent>
            
            <TabsContent value="squad-builder" className="mt-4">
              <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                <input type="hidden" name="count" value="3" />
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="squad-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="squad-query" name="query" ref={squadTextAreaRef} defaultValue={squadState.squadsInput?.query} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                </div>
                <SubmitButton icon={<Users className="mr-2 h-4 w-4" />} pendingText="Building..." text="Build Squad" />
              </form>
            </TabsContent>

            <TabsContent value="test-assistant" className="mt-4">
              <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="test-case">Testcase and the Ability you are testing</Label>
                  <Textarea onKeyDown={handleKeyDown} id="test-case" name="testCase" ref={testCaseAbilityRef} defaultValue={testCaseState.testCaseInput?.testCase} placeholder="e.g., 'Test if the new unit's 'Force Shield' ability correctly dispels all debuffs.'" required rows={2} className="text-base" />
                </div>
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="expected-result">Expected Result</Label>
                  <Textarea onKeyDown={handleKeyDown} id="expected-result" name="expectedResult" ref={testCaseExpectedRef} defaultValue={testCaseState.testCaseInput?.expectedResult} placeholder="e.g., 'All debuffs on the new unit should be cleared, and it should gain the 'Protection Up' buff.'" required rows={2} className="text-base" />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-details">New Unit Details</Label>
                   <p className="text-xs text-muted-foreground">
                    You can copy and paste the ability details from the design document without naming the unit.
                  </p>
                  <Textarea onKeyDown={handleKeyDown} id="unit-details" name="unitDetails" ref={testCaseUnitRef} defaultValue={testCaseState.testCaseInput?.unitDetails} placeholder="Describe the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons." required rows={4} className="text-base" />
                </div>
                 <SubmitButton icon={<TestTube className="mr-2 h-4 w-4" />} pendingText="Generating..." text="Generate Test Case" />
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {activeTab === 'unit-finder' && renderUnitFinderContent()}
        {activeTab === 'squad-builder' && renderSquadBuilderContent()}
        {activeTab === 'test-assistant' && renderTestAssistantContent()}
      </div>
    </div>
  );
}
