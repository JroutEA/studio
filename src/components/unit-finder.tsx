'use client';

import { useActionState, useEffect, useState, useRef, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { findUnits, buildSquad, generateTestCase, type FormState } from '@/app/actions';
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
import { History, Users, TestTube } from 'lucide-react';
import { UnitList } from './unit-list';
import { UnitListSkeleton } from './unit-list-skeleton';
import { SquadList } from './squad-list';
import { SquadListSkeleton } from './squad-list-skeleton';
import { TestCaseDisplay } from './test-case-display';
import { HolocronIcon } from './holocron-icon';
import { DarthVaderLoader } from './darth-vader-loader';

const initialState: FormState = {
  message: '',
};

const UNIT_HISTORY_KEY = 'swgoh_unit_query_history';
const SQUAD_HISTORY_KEY = 'swgoh_squad_query_history';
const TEST_CASE_HISTORY_KEY = 'swgoh_test_case_history';


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
  const [unitCount, setUnitCount] = useState(10);
  const [previousUnitCount, setPreviousUnitCount] = useState(0);


  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
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
  }, []);

  const state = activeTab === 'unit-finder' ? unitState :
                activeTab === 'squad-builder' ? squadState :
                testCaseState;
  
  const history = activeTab === 'unit-finder' ? unitHistory :
                  activeTab === 'squad-builder' ? squadHistory :
                  testCaseHistory;

  useEffect(() => {
    try {
      const storedUnitHistory = localStorage.getItem(UNIT_HISTORY_KEY);
      if (storedUnitHistory) setUnitHistory(JSON.parse(storedUnitHistory));

      const storedSquadHistory = localStorage.getItem(SQUAD_HISTORY_KEY);
      if (storedSquadHistory) setSquadHistory(JSON.parse(storedSquadHistory));

      const storedTestCaseHistory = localStorage.getItem(TEST_CASE_HISTORY_KEY);
      if (storedTestCaseHistory) setTestCaseHistory(JSON.parse(storedTestCaseHistory));

    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
    }
  }, []);
  
  const handleLoadMore = () => {
    if (unitState.query) {
      const newCount = unitCount + 5;
      setPreviousUnitCount(unitCount);
      setUnitCount(newCount);
      
      const formData = new FormData();
      formData.set('query', unitState.query);
      formData.set('count', newCount.toString());
      
      startTransition(() => {
        unitFormAction(formData);
      });
    }
  };

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({ variant: 'destructive', title: 'Error', description: state.message });
    }
    
    if (activeTab === 'unit-finder' && unitState.message === 'success' && unitState.query) {
       // If the new result count is 10 or less, it's a new search.
       if (unitState.units && unitState.units.length <= 10) {
        setPreviousUnitCount(0);
        setUnitCount(10);
       }
       setUnitHistory(prevHistory => {
        if (!prevHistory.includes(unitState.query!)) {
          const newHistory = [unitState.query!, ...prevHistory].slice(0, 20);
          localStorage.setItem(UNIT_HISTORY_KEY, JSON.stringify(newHistory));
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
  }, [unitState, squadState, testCaseState, toast, activeTab]);

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
                <TabsTrigger value="unit-finder">Unit Finder</TabsTrigger>
                <TabsTrigger value="squad-builder">Squad Builder</TabsTrigger>
                <TabsTrigger value="test-assistant">Test Assistant</TabsTrigger>
              </TabsList>

              <TabsContent value="unit-finder" className="mt-4">
                 <form action={unitFormAction} ref={unitFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="unit-query">Your Query</Label>
                    <Textarea onKeyDown={handleKeyDown} id="unit-query" name="query" ref={unitTextAreaRef} placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                    <input type="hidden" name="count" value="10" />
                  </div>
                  <SubmitButton icon={<HolocronIcon className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Searching..." text="Find Units" />
                </form>
              </TabsContent>
              
              <TabsContent value="squad-builder" className="mt-4">
                <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="squad-query">Your Query</Label>
                    <Textarea onKeyDown={handleKeyDown} id="squad-query" name="query" ref={squadTextAreaRef} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                  </div>
                  <SubmitButton icon={<Users className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Building..." text="Build Squad" />
                </form>
              </TabsContent>

              <TabsContent value="test-assistant" className="mt-4">
                <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="test-case">Testcase and the Ability you are testing</Label>
                    <Textarea onKeyDown={handleKeyDown} id="test-case" name="testCase" ref={testCaseAbilityRef} placeholder="e.g., 'Test if the new unit's 'Force Shield' ability correctly dispels all debuffs.'" required rows={2} className="text-base" />
                  </div>
                   <div className="grid w-full gap-1.5">
                    <Label htmlFor="expected-result">Expected Result</Label>
                    <Textarea onKeyDown={handleKeyDown} id="expected-result" name="expectedResult" ref={testCaseExpectedRef} placeholder="e.g., 'All debuffs on the new unit should be cleared, and it should gain the 'Protection Up' buff.'" required rows={2} className="text-base" />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="unit-details">New Unit Details</Label>
                     <p className="text-xs text-muted-foreground">
                      You can copy and paste the ability details from the design document without naming the unit.
                    </p>
                    <Textarea onKeyDown={handleKeyDown} id="unit-details" name="unitDetails" ref={testCaseUnitRef} placeholder="Describe the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons." required rows={4} className="text-base" />
                  </div>
                   <SubmitButton icon={<TestTube className="mr-2 h-4 w-4" suppressHydrationWarning />} pendingText="Generating..." text="Generate Test Case" />
                </form>
              </TabsContent>

            </Tabs>
          ) : (
             <div className="space-y-4 mt-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-query">Your Query</Label>
                  <Textarea id="unit-query" name="query" placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                </div>
                <Button className="w-full sm-w-auto">
                  <HolocronIcon className="mr-2 h-4 w-4" suppressHydrationWarning />
                  Find Units
                </Button>
             </div>
          )}
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {(isUnitFormPending && unitCount <= 10) && activeTab === 'unit-finder' && <UnitListSkeleton />}
        {isSquadFormPending && activeTab === 'squad-builder' && <SquadListSkeleton />}
        {isTestCaseFormPending && activeTab === 'test-assistant' && <SquadListSkeleton />}

        {unitState.units && unitState.units.length > 0 && activeTab === 'unit-finder' && (
          <div className="space-y-4">
            <UnitList 
              units={unitState.units} 
              isLoadingMore={isUnitFormPending && unitCount > 10}
              previousCount={previousUnitCount} 
            />
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isUnitFormPending}>
                {isUnitFormPending && unitCount > 10 ? (
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
        )}

        {squadState.squads && squadState.squads.length > 0 && activeTab === 'squad-builder' && !isSquadFormPending && (
          <SquadList squads={squadState.squads} />
        )}

        {testCaseState.testCase && activeTab === 'test-assistant' && !isTestCaseFormPending && (
          <TestCaseDisplay testCase={testCaseState.testCase} />
        )}


        {!pending && isClient && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-primary/20">
            {activeTab === 'unit-finder' && (!unitState.units || unitState.units.length === 0) &&
              <>
                <HolocronIcon className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold mt-2">Your matched units will appear here</h3>
                <p>Enter a description above to get started.</p>
              </>
            }
            {activeTab === 'squad-builder' && (!squadState.squads || squadState.squads.length === 0) &&
              <>
                <Users className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold mt-2">Your generated squads will appear here</h3>
                <p>Describe the squad you want to build above.</p>
              </>
            }
            {activeTab === 'test-assistant' && !testCaseState.testCase &&
              <>
                <TestTube className="mx-auto h-12 w-12" suppressHydrationWarning />
                <h3 className="text-lg font-semibold mt-2">Your generated test case will appear here</h3>
                <p>Describe the scenario you want to test above.</p>
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
}
