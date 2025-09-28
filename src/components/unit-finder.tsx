'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import {
  findUnits,
  buildSquad,
  generateTestCase,
} from '@/app/actions';
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
import { useState } from 'react';
import { SavedSquadsList } from './saved-squads-list';

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];

const UNIT_HISTORY_KEY = 'swgoh_unit_query_history';
const SQUAD_HISTORY_KEY = 'swgoh_squad_query_history';
const TEST_CASE_HISTORY_KEY = 'swgoh_test_case_history';
const SAVED_SQUADS_KEY = 'swgoh_saved_squads';

function SubmitButton({
  icon,
  pendingText,
  text,
  isPending,
}: {
  icon: React.ReactNode;
  pendingText: string;
  text: string;
  isPending: boolean;
}) {
  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
      {isPending ? (
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('unit-finder');

  // Form states from useActionState
  const [unitState, unitFormAction, isUnitFormPending] = useActionState(findUnits, { message: '', units: [] });
  const [squadState, squadFormAction, isSquadFormPending] = useActionState(buildSquad, { message: '', squads: [] });
  const [testCaseState, testCaseFormAction, isTestCaseFormPending] = useActionState(generateTestCase, { message: '' });

  const isPending = isUnitFormPending || isSquadFormPending || isTestCaseFormPending;

  // States for controlled inputs
  const [unitQuery, setUnitQuery] = useState('');
  const [squadQuery, setSquadQuery] = useState('');
  const [testCaseQuery, setTestCaseQuery] = useState('');
  const [unitDetails, setUnitDetails] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  
  // History and saved squads state
  const [unitHistory, setUnitHistory] = useState<string[]>([]);
  const [squadHistory, setSquadHistory] = useState<string[]>([]);
  const [testCaseHistory, setTestCaseHistory] = useState<any[]>([]);
  const [savedSquads, setSavedSquads] = useState<Squad[]>([]);

  // UI state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedSquadsOpen, setIsSavedSquadsOpen] = useState(false);
  
  // Form refs
  const unitFormRef = useRef<HTMLFormElement>(null);
  const squadFormRef = useRef<HTMLFormElement>(null);
  const testCaseFormRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    try {
      setUnitHistory(JSON.parse(localStorage.getItem(UNIT_HISTORY_KEY) || '[]'));
      setSquadHistory(JSON.parse(localStorage.getItem(SQUAD_HISTORY_KEY) || '[]'));
      setTestCaseHistory(JSON.parse(localStorage.getItem(TEST_CASE_HISTORY_KEY) || '[]'));
      setSavedSquads(JSON.parse(localStorage.getItem(SAVED_SQUADS_KEY) || '[]'));
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
    }
  }, []);
  
  useEffect(() => {
    if (unitState.message && unitState.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: unitState.message });
    } else if (unitState.message === 'success' && unitState.query) {
      setUnitQuery(unitState.query);
      setUnitHistory(prev => {
        if (!prev.includes(unitState.query!)) {
          const newHistory = [unitState.query!, ...prev].slice(0, 20);
          localStorage.setItem(UNIT_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prev;
      });
    }
  }, [unitState, toast]);

  useEffect(() => {
    if (squadState.message && squadState.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: squadState.message });
    } else if (squadState.message === 'success' && squadState.squadsInput?.query) {
      setSquadQuery(squadState.squadsInput.query);
      setSquadHistory(prev => {
        if (!prev.includes(squadState.squadsInput!.query)) {
          const newHistory = [squadState.squadsInput!.query, ...prev].slice(0, 20);
          localStorage.setItem(SQUAD_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prev;
      });
    }
  }, [squadState, toast]);

  useEffect(() => {
    if (testCaseState.message && testCaseState.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: testCaseState.message });
    } else if (testCaseState.message === 'success' && testCaseState.testCaseInput) {
      const { testCase, unitDetails, expectedResult } = testCaseState.testCaseInput;
      setTestCaseQuery(testCase);
      setUnitDetails(unitDetails);
      setExpectedResult(expectedResult);
      setTestCaseHistory(prev => {
        const historyValueJSON = JSON.stringify(testCaseState.testCaseInput);
        if (!prev.find(h => JSON.stringify(h) === historyValueJSON)) {
          const newHistory = [testCaseState.testCaseInput, ...prev].slice(0, 20);
          localStorage.setItem(TEST_CASE_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prev;
      });
    }
  }, [testCaseState, toast]);

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
  
  const handleLoadMore = () => {
    if (isPending) return;

    if (activeTab === 'unit-finder' && unitFormRef.current) {
        const formData = new FormData(unitFormRef.current);
        const currentCount = unitState.units?.length || 0;
        formData.set('count', (currentCount + 5).toString());
        unitFormAction(formData);
    } else if (activeTab === 'squad-builder' && squadFormRef.current) {
        const formData = new FormData(squadFormRef.current);
        const currentCount = squadState.squads?.length || 0;
        formData.set('count', (currentCount + 3).toString());
        squadFormAction(formData);
    }
  };

  const handleHistoryClick = (query: any) => {
    if (activeTab === 'unit-finder') {
      setUnitQuery(query);
    } else if (activeTab === 'squad-builder') {
      setSquadQuery(query);
    } else if (activeTab === 'test-assistant') {
      setTestCaseQuery(query.testCase);
      setUnitDetails(query.unitDetails);
      setExpectedResult(query.expectedResult);
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

    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLTextAreaElement).form?.requestSubmit();
    }
  };

  const renderUnitFinderContent = () => {
    if (isUnitFormPending && !unitState.units?.length) {
      return <UnitListSkeleton />;
    }
    if (unitState.units && unitState.units.length > 0) {
      return (
        <div className="space-y-4">
          <UnitList 
            units={unitState.units}
            isLoadingMore={isUnitFormPending}
            previousCount={unitState.units.length}
          />
          <div className="text-center">
            <Button onClick={handleLoadMore} disabled={isUnitFormPending}>
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
    if (isSquadFormPending && !squadState.squads?.length) {
      return <SquadListSkeleton />;
    }
    if (squadState.squads && squadState.squads.length > 0) {
      return (
        <div className="space-y-4">
          <SquadList 
            squads={squadState.squads}
            isLoadingMore={isSquadFormPending}
            savedSquads={savedSquads}
            onToggleSave={handleToggleSaveSquad}
          />
          <div className="text-center">
            <Button onClick={handleLoadMore} disabled={isSquadFormPending}>
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
    if (isTestCaseFormPending && !testCaseState.testCase) {
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
                  <HolocronIcon className="w-6 h-6" />
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
                      <Star className="h-4 w-4" />
                      <span className="sr-only">View saved squads</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Saved Squads</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      {savedSquads.length > 0 ? (
                        <SavedSquadsList squads={savedSquads} onToggleSave={handleToggleSaveSquad} />
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
                  <Button variant="outline" size="icon" disabled={isPending}>
                    <History className="h-4 w-4" />
                    <span className="sr-only">View query history</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Query History</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-2">
                    {(activeTab === 'unit-finder' ? unitHistory : activeTab === 'squad-builder' ? squadHistory : testCaseHistory).length > 0 ? (
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
               <form action={unitFormAction} ref={unitFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="unit-query" name="query" value={unitQuery} onChange={e => setUnitQuery(e.target.value)} placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                </div>
                <SubmitButton
                  icon={<HolocronIcon className="mr-2 h-4 w-4" />}
                  pendingText="Searching..."
                  text="Find Units"
                  isPending={isUnitFormPending}
                />
              </form>
            </TabsContent>
            
            <TabsContent value="squad-builder" className="mt-4">
              <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="squad-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="squad-query" name="query" value={squadQuery} onChange={e => setSquadQuery(e.target.value)} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                </div>
                <SubmitButton
                  icon={<Users className="mr-2 h-4 w-4" />}
                  pendingText="Building..."
                  text="Build Squad"
                  isPending={isSquadFormPending}
                />
              </form>
            </TabsContent>

            <TabsContent value="test-assistant" className="mt-4">
              <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="test-case">Testcase and the Ability you are testing</Label>
                  <Textarea onKeyDown={handleKeyDown} id="test-case" name="testCase" value={testCaseQuery} onChange={e => setTestCaseQuery(e.target.value)} placeholder="e.g., 'Test if the new unit's 'Force Shield' ability correctly dispels all debuffs.'" required rows={2} className="text-base" />
                </div>
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="expected-result">Expected Result</Label>
                  <Textarea onKeyDown={handleKeyDown} id="expected-result" name="expectedResult" value={expectedResult} onChange={e => setExpectedResult(e.target.value)} placeholder="e.g., 'All debuffs on the new unit should be cleared, and it should gain the 'Protection Up' buff.'" required rows={2} className="text-base" />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-details">New Unit Details</Label>
                   <p className="text-xs text-muted-foreground">
                    You can copy and paste the ability details from the design document without naming the unit.
                  </p>
                  <Textarea onKeyDown={handleKeyDown} id="unit-details" name="unitDetails" value={unitDetails} onChange={e => setUnitDetails(e.target.value)} placeholder="Describe the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons." required rows={4} className="text-base" />
                </div>
                 <SubmitButton
                  icon={<TestTube className="mr-2 h-4 w-4" />}
                  pendingText="Generating..."
                  text="Generate Test Case"
                  isPending={isTestCaseFormPending}
                />
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
