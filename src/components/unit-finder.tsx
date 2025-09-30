'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import {
  findUnits,
  buildSquad,
  generateTestCase,
  type FormState
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
import { SavedSquadsList } from './saved-squads-list';

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];

const UNIT_HISTORY_KEY = 'swgoh_unit_query_history';
const SQUAD_HISTORY_KEY = 'swgoh_squad_query_history';
const TEST_CASE_HISTORY_KEY = 'swgoh_test_case_history';
const SAVED_SQUADS_KEY = 'swgoh_saved_squads';

const initialUnitState: FormState = { message: '', units: [] };
const initialSquadState: FormState = { message: '', squads: [] };
const initialTestCaseState: FormState = { message: '' };

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
  
  const [unitState, unitFormAction, isUnitPending] = useActionState(findUnits, initialUnitState);
  const [squadState, squadFormAction, isSquadPending] = useActionState(buildSquad, initialSquadState);
  const [testCaseState, testCaseFormAction, isTestCasePending] = useActionState(generateTestCase, initialTestCaseState);

  const isPending = isUnitPending || isSquadPending || isTestCasePending;
  
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
      toast({
        title: unitState.message.includes('found') ? 'Info' : unitState.message.includes('Invalid') ? 'Warning' : 'Error',
        description: unitState.message,
        variant: unitState.message.includes('found') || unitState.message.includes('Invalid') ? 'default' : 'destructive',
      });
    }
    if (unitState.switchToTab) {
      setActiveTab(unitState.switchToTab);
    }
    if (unitState.message === 'success' && unitState.query) {
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
       toast({
          title: squadState.message.includes('found') ? 'Info' : squadState.message.includes('Invalid') ? 'Warning' : 'Error',
          description: squadState.message,
          variant: squadState.message.includes('found') || squadState.message.includes('Invalid') ? 'default' : 'destructive',
        });
    }
    if (squadState.switchToTab) {
      setActiveTab(squadState.switchToTab);
    }
    if (squadState.message === 'success' && squadState.squadsInput?.query) {
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
      toast({ variant: 'destructive', title: 'Error generating test case', description: testCaseState.message });
    }
    if (testCaseState.message === 'success' && testCaseState.testCaseInput) {
      const historyValueJSON = JSON.stringify(testCaseState.testCaseInput);
      setTestCaseHistory(prev => {
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
  
    if (activeTab === 'unit-finder' && unitFormRef.current && unitState.query) {
      const form = unitFormRef.current;
      (form.elements.namedItem('loadMoreQuery') as HTMLInputElement).value = unitState.query;
      (form.elements.namedItem('count') as HTMLInputElement).value = '5';
      form.requestSubmit();
    } else if (activeTab === 'squad-builder' && squadFormRef.current && squadState.squadsInput?.query) {
      const form = squadFormRef.current;
      (form.elements.namedItem('loadMoreQuery') as HTMLInputElement).value = squadState.squadsInput.query;
      (form.elements.namedItem('count') as HTMLInputElement).value = '3';
      form.requestSubmit();
    }
  };

  const handleHistoryClick = (query: any) => {
    if (activeTab === 'unit-finder' && unitFormRef.current) {
      const input = unitFormref.current.elements.namedItem('query') as HTMLTextAreaElement;
      if (input) input.value = query;
    } else if (activeTab === 'squad-builder' && squadFormRef.current) {
      const input = squadFormRef.current.elements.namedItem('query') as HTMLTextAreaElement;
      if (input) input.value = query;
    } else if (activeTab === 'test-assistant' && testCaseFormRef.current) {
      const testCaseInput = testCaseFormRef.current.elements.namedItem('testCase') as HTMLTextAreaElement;
      const unitDetailsInput = testCaseFormRef.current.elements.namedItem('unitDetails') as HTMLTextAreaElement;
      const expectedResultInput = testCaseFormRef.current.elements.namedItem('expectedResult') as HTMLTextAreaElement;
      if (testCaseInput && unitDetailsInput && expectedResultInput) {
          testCaseInput.value = query.testCase;
          unitDetailsInput.value = query.unitDetails;
          expectedResultInput.value = query.expectedResult;
      }
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
      const form = (event.target as HTMLTextAreaElement).form;
      if (form) {
        // Reset loadMore specific fields before a manual submission
        const loadMoreInput = form.elements.namedItem('loadMoreQuery') as HTMLInputElement;
        if(loadMoreInput) loadMoreInput.value = '';

        const countInput = form.elements.namedItem('count') as HTMLInputElement;
        if(countInput) countInput.value = (activeTab === 'unit-finder' ? '10' : '3');
        
        form.requestSubmit();
      }
    }
  };

  const renderUnitFinderContent = () => {
    const isLoadingFirstTime = isUnitPending && !unitState.units?.length && !unitState.squads?.length;
    const isLoadingMore = isUnitPending && !!unitState.units?.length;
    
    // Squad query was made from Unit Finder
    const units = (activeTab === 'unit-finder' && squadState.switchToTab === 'unit-finder') ? squadState.units : unitState.units;

    if (isLoadingFirstTime) {
      return <UnitListSkeleton />;
    }
    
    // If the query was for a squad, the results will be in unitState after action change
    if (unitState.switchToTab === 'squad-builder') {
      if (isUnitPending) return <SquadListSkeleton />;
      if (unitState.squads && unitState.squads.length > 0) {
        return (
          <SquadList
            squads={unitState.squads}
            savedSquads={savedSquads}
            onToggleSave={handleToggleSaveSquad}
            title="Generated Squads"
          />
        );
      }
    }

    if (units && units.length > 0) {
      const hasMoreUnits = true;
      return (
        <div className="space-y-4">
          <UnitList 
            units={units}
            isLoadingMore={isLoadingMore}
          />
          {hasMoreUnits && unitState.message !== 'No new units found.' && (
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isPending}>
                {isLoadingMore ? (
                  <>
                    <DarthVaderLoader className="mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  'Load 5 More'
                )}
              </Button>
            </div>
          )}
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
    const isLoadingFirstTime = isSquadPending && !squadState.squads?.length;
    const isLoadingMore = isSquadPending && !!squadState.squads?.length;
    
    // Unit query was made from Squad Builder
    const squads = (activeTab === 'squad-builder' && unitState.switchToTab === 'squad-builder') ? unitState.squads : squadState.squads;

    if (isLoadingFirstTime) {
      return <SquadListSkeleton />;
    }

    if (squads && squads.length > 0) {
      const hasMoreSquads = true; // Assume there can always be more
      return (
        <div className="space-y-4">
          <SquadList 
            squads={squads}
            isLoadingMore={isLoadingMore}
            savedSquads={savedSquads}
            onToggleSave={handleToggleSaveSquad}
          />
          {hasMoreSquads && squadState.message !== 'No new squads found.' && (
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isPending}>
                {isLoadingMore ? (
                  <>
                    <DarthVaderLoader className="mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  'Load 3 More'
                )}
              </Button>
            </div>
          )}
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
    if (isTestCasePending && !testCaseState.testCase) {
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
                  <Textarea onKeyDown={handleKeyDown} id="unit-query" name="query" defaultValue={unitState.query ?? ''} placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                  <input type="hidden" name="loadMoreQuery" />
                  <input type="hidden" name="count" defaultValue="10" />
                </div>
                <SubmitButton
                  icon={<HolocronIcon className="mr-2 h-4 w-4" />}
                  pendingText="Searching..."
                  text="Find Units"
                  isPending={isUnitPending}
                />
              </form>
            </TabsContent>
            
            <TabsContent value="squad-builder" className="mt-4">
              <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="squad-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="squad-query" name="query" defaultValue={squadState.squadsInput?.query ?? ''} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                  <input type="hidden" name="loadMoreQuery" />
                  <input type="hidden" name="count" defaultValue="3" />
                </div>
                <SubmitButton
                  icon={<Users className="mr-2 h-4 w-4" />}
                  pendingText="Building..."
                  text="Build Squad"
                  isPending={isSquadPending}
                />
              </form>
            </TabsContent>

            <TabsContent value="test-assistant" className="mt-4">
              <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="test-case">Put the Abilility along with the test scenario (test_step)</Label>
                  <Textarea onKeyDown={handleKeyDown} id="test-case" name="testCase" defaultValue={testCaseState.testCaseInput?.testCase ?? ''} placeholder="Step: Verify if any Bonus Move is applied, it is only applied during an allies turn while performing an attack on an enemy. Test Data: Check in game during battle for the timing of the bonus move application" required rows={3} className="text-base" />
                </div>
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="expected-result">Expected Result of above test Step.</Label>
                  <Textarea onKeyDown={handleKeyDown} id="expected-result" name="expectedResult" defaultValue={testCaseState.testCaseInput?.expectedResult ?? ''} placeholder="If the Bonus Move is not applied during an allies turn while attacking an enemy, bug it" required rows={2} className="text-base" />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-details">the 'new_unit ability design'.</Label>
                   <p className="text-xs text-muted-foreground">
                    You can copy and paste the ability details from the design document without naming the unit.
                  </p>
                  <Textarea onKeyDown={handleKeyDown} id="unit-details" name="unitDetails" defaultValue={testCaseState.testCaseInput?.unitDetails ?? ''} placeholder={`Basic - Destructive Rotation\nDescription: Deal Special damage to target enemy.\n\nUpgrades:\n\n+5% Damage\nDeal an additional instance of damage\n+5% Damage\nDeal an additional instance of damage\nInflict Defense Down for 1 turn\nDeal an additional instance of damage\nDuring new_unit's turn, Dark Side Bounty Hunter Attackers Stealth for 2 turns\nFinal Text: Deal Special damage to target enemy four times and inflict them with Defense Down for 1 turn.`} required rows={4} className="text-base" />
                </div>
                 <SubmitButton
                  icon={<TestTube className="mr-2 h-4 w-4" />}
                  pendingText="Generating..."
                  text="help me test this"
                  isPending={isTestCasePending}
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
