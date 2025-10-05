
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
import { History, Users, TestTube, Trash2, Star, BrainCircuit, Download, AlertTriangle, Terminal, Bug } from 'lucide-react';
import { UnitList } from './unit-list';
import { UnitListSkeleton } from './unit-list-skeleton';
import { SquadList } from './squad-list';
import { SquadListSkeleton } from './squad-list-skeleton';
import { TestCaseDisplay } from './test-case-display';
import { HolocronIcon } from './holocron-icon';
import { DarthVaderLoader } from './darth-vader-loader';
import { SavedSquadsList } from './saved-squads-list';
import { Skeleton } from './ui/skeleton';
import { FallbackPromptDisplay } from './fallback-prompt-display';
import { cn } from '@/lib/utils';


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
  className
}: {
  icon: React.ReactNode;
  pendingText: string;
  text: string;
  isPending: boolean;
  className?: string;
}) {
  return (
    <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto", className)}>
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
  const { toast, dismiss } = useToast();
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
  const [isClient, setIsClient] = useState(false);

  // UI state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedSquadsOpen, setIsSavedSquadsOpen] = useState(false);
  const deletionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form refs
  const unitFormRef = useRef<HTMLFormElement>(null);
  const squadFormRef = useRef<HTMLFormElement>(null);
  const testCaseFormRef = useRef<HTMLFormElement>(null);
  const downloadTriggerRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // This effect runs once on the client to safely access localStorage
    setIsClient(true);
    try {
      setUnitHistory(JSON.parse(localStorage.getItem(UNIT_HISTORY_KEY) || '[]'));
      setSquadHistory(JSON.parse(localStorage.getItem(SQUAD_HISTORY_KEY) || '[]'));
      setTestCaseHistory(JSON.parse(localStorage.getItem(TEST_CASE_HISTORY_KEY) || '[]'));
      setSavedSquads(JSON.parse(localStorage.getItem(SAVED_SQUADS_KEY) || '[]'));
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      // In case of corrupted data, clear it
      localStorage.removeItem(UNIT_HISTORY_KEY);
      localStorage.removeItem(SQUAD_HISTORY_KEY);
      localStorage.removeItem(TEST_CASE_HISTORY_KEY);
      localStorage.removeItem(SAVED_SQUADS_KEY);
    }
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    if (unitState.query) { // Save history on any submission, success or fail
      setUnitHistory(prev => {
        if (!prev.includes(unitState.query!)) {
          const newHistory = [unitState.query!, ...prev].slice(0, 20);
          localStorage.setItem(UNIT_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prev;
      });
    }

    if (unitState.message && unitState.message !== 'success' && !unitState.fallbackPrompt) {
      toast({
        title: unitState.message.includes('found') ? 'Info' : unitState.message.includes('Invalid') ? 'Warning' : 'Error',
        description: unitState.message,
        variant: unitState.message.includes('found') || unitState.message.includes('Invalid') ? 'default' : 'destructive',
      });
    }
    if (unitState.switchToTab) {
      setActiveTab(unitState.switchToTab);
    }
  }, [unitState, toast, isClient]);

  useEffect(() => {
    if (!isClient) return;

    if (squadState.squadsInput?.query) { // Save history on any submission
      setSquadHistory(prev => {
        if (!prev.includes(squadState.squadsInput!.query)) {
          const newHistory = [squadState.squadsInput!.query, ...prev].slice(0, 20);
          localStorage.setItem(SQUAD_HISTORY_KEY, JSON.stringify(newHistory));
          return newHistory;
        }
        return prev;
      });
    }

    if (squadState.message && squadState.message !== 'success' && !squadState.fallbackPrompt) {
       toast({
          title: squadState.message.includes('found') ? 'Info' : squadState.message.includes('Invalid') ? 'Warning' : 'Error',
          description: squadState.message,
          variant: squadState.message.includes('found') || squadState.message.includes('Invalid') ? 'default' : 'destructive',
        });
    }
    if (squadState.switchToTab) {
      setActiveTab(squadState.switchToTab);
    }
  }, [squadState, toast, isClient]);

  useEffect(() => {
    if (!isClient) return;

    if (testCaseState.testCaseInput) { // Save history on any submission
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
    
    if (testCaseState.message && testCaseState.message !== 'success' && !testCaseState.fallbackPrompt) {
      toast({ variant: 'destructive', title: 'Error generating test case', description: testCaseState.message });
    }
  }, [testCaseState, toast, isClient]);

  const handleToggleSaveSquad = (squad: Squad) => {
    setSavedSquads(prevSavedSquads => {
      const isSaved = prevSavedSquads.some(saved => saved.leader.name === squad.leader.name && saved.description === squad.description);
      let newSavedSquads;
      if (isSaved) {
        newSavedSquads = prevSavedSquads.filter(saved => !(saved.leader.name === squad.leader.name && saved.description === squad.description));
        toast({ title: "Squad Unsaved", description: `The squad has been removed from your saved squads.` });
      } else {
        newSavedSquads = [...prevSavedSquads, squad];
        toast({ title: "Squad Saved!", description: `The squad has been added to your saved squads.` });
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
      (form.elements.namedItem('count') as HTMLInputElement).value = '3';
      form.requestSubmit();
    } else if (activeTab === 'squad-builder' && squadFormRef.current && squadState.squadsInput?.query) {
      const form = squadFormRef.current;
      (form.elements.namedItem('loadMoreQuery') as HTMLInputElement).value = squadState.squadsInput.query;
      (form.elements.namedItem('count') as HTMLInputElement).value = '1';
      form.requestSubmit();
    }
  };

  const handleHistoryClick = (query: any) => {
    if (activeTab === 'unit-finder' && unitFormRef.current) {
      const input = unitFormRef.current.elements.namedItem('query') as HTMLTextAreaElement;
      if (input) input.value = query;
    } else if (activeTab === 'squad-builder' && squadFormRef.current) {
      const input = squadFormRef.current.elements.namedItem('query') as HTMLTextAreaElement;
      if (input) input.value = query;
    } else if (activeTab === 'test-assistant' && testCaseFormRef.current) {
      const unitDetailsInput = testCaseFormRef.current.elements.namedItem('unitDetails') as HTMLTextAreaElement;
      const testCaseInput = testCaseFormRef.current.elements.namedItem('testCase') as HTMLTextAreaElement;
      const expectedResultInput = testCaseFormRef.current.elements.namedItem('expectedResult') as HTMLTextAreaElement;
      if (testCaseInput && unitDetailsInput && expectedResultInput) {
          unitDetailsInput.value = query.unitDetails;
          testCaseInput.value = query.testCase;
          expectedResultInput.value = query.expectedResult;
      }
    }
    setIsHistoryOpen(false);
  };
  
  const handleDeleteHistoryItem = (index: number) => {
    let currentHistory: any[], setHistory: React.Dispatch<React.SetStateAction<any[]>>, storageKey: string;
    
    switch (activeTab) {
      case 'unit-finder':
        currentHistory = [...unitHistory];
        setHistory = setUnitHistory;
        storageKey = UNIT_HISTORY_KEY;
        break;
      case 'squad-builder':
        currentHistory = [...squadHistory];
        setHistory = setSquadHistory;
        storageKey = SQUAD_HISTORY_KEY;
        break;
      case 'test-assistant':
        currentHistory = [...testCaseHistory];
        setHistory = setTestCaseHistory;
        storageKey = TEST_CASE_HISTORY_KEY;
        break;
      default:
        return;
    }

    const temporaryHistory = currentHistory.filter((_, i) => i !== index);
    setHistory(temporaryHistory);

    if (deletionTimerRef.current) {
      clearTimeout(deletionTimerRef.current);
    }
    dismiss();

    const { id } = toast({
      title: "History item deleted",
      description: "You can undo this action.",
      duration: 5000,
      action: (
        <Button
          variant="outline"
          onClick={() => {
            if (deletionTimerRef.current) {
              clearTimeout(deletionTimerRef.current);
              deletionTimerRef.current = null;
            }
            setHistory(currentHistory); // Restore original history
            dismiss(id);
          }}
        >
          Undo
        </Button>
      ),
    });

    deletionTimerRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(temporaryHistory));
      deletionTimerRef.current = null;
    }, 5000);
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
        if(countInput) countInput.value = (activeTab === 'unit-finder' ? '6' : '2');
        
        form.requestSubmit();
      }
    }
  };

  const showDownloadButton = 
    (activeTab === 'unit-finder' && unitState.units && unitState.units.length > 0 && !unitState.fallbackPrompt) ||
    (activeTab === 'squad-builder' && squadState.squads && squadState.squads.length > 0 && !squadState.fallbackPrompt) ||
    (activeTab === 'test-assistant' && testCaseState.testCase && !testCaseState.fallbackPrompt);


  if (!isClient) {
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
                    <CardTitle className="font-headline text-3xl">Holocron 2.0</CardTitle>
                    <CardDescription>
                      This IS the droid you're looking for... to test your units.
                    </CardDescription>
                  </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                </div>
              </div>
           </CardHeader>
           <CardContent>
              <Tabs defaultValue="unit-finder" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="unit-finder">Unit Finder</TabsTrigger>
                  <TabsTrigger value="squad-builder">Squad Builder</TabsTrigger>
                  <TabsTrigger value="test-assistant">Test Assistant</TabsTrigger>
                </TabsList>
              </Tabs>
           </CardContent>
        </Card>
        <div className="max-w-4xl mx-auto"><UnitListSkeleton /></div>
      </div>
    );
  }

  const renderContent = () => {
    let currentState: FormState = unitState;
    if (activeTab === 'squad-builder') currentState = squadState;
    if (activeTab === 'test-assistant') currentState = testCaseState;
    
    if (currentState.fallbackPrompt) {
        return (
            <FallbackPromptDisplay
                errorMessage={currentState.message}
                fallbackPrompt={currentState.fallbackPrompt}
            />
        );
    }
  
    switch (activeTab) {
      case 'unit-finder':
        return renderUnitFinderContent();
      case 'squad-builder':
        return renderSquadBuilderContent();
      case 'test-assistant':
        return renderTestAssistantContent();
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (activeTab) {
        case 'unit-finder': return 'border-unit-finder-accent/20';
        case 'squad-builder': return 'border-squad-builder-accent/20';
        case 'test-assistant': return 'border-test-assistant-accent/20';
        default: return 'border-primary/20';
    }
  }


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
            triggerRef={downloadTriggerRef}
            query={unitState.query}
          />
          {hasMoreUnits && unitState.message !== 'No new units found.' && (
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isPending} className="bg-unit-finder-accent hover:bg-unit-finder-accent/90 text-white dark:text-black">
                {isUnitPending ? (
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
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-unit-finder-accent/20">
        <HolocronIcon className="mx-auto h-12 w-12 text-unit-finder-accent" />
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
            triggerRef={downloadTriggerRef}
            query={squadState.squadsInput?.query}
          />
          {hasMoreSquads && squadState.message !== 'No new squads found.' && (
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={isPending} className="bg-squad-builder-accent hover:bg-squad-builder-accent/90 text-white dark:text-black">
                {isSquadPending ? (
                  <>
                    <DarthVaderLoader className="mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  'Load 1 More'
                )}
              </Button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-squad-builder-accent/20">
        <Users className="mx-auto h-12 w-12 text-squad-builder-accent" />
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
      return <TestCaseDisplay testCase={testCaseState.testCase} triggerRef={downloadTriggerRef} />;
    }
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg border-test-assistant-accent/20">
        <Bug className="mx-auto h-12 w-12 text-test-assistant-accent" />
        <h3 className="text-lg font-semibold mt-2">Your generated test case will appear here</h3>
        <p>Describe the scenario you want to test above.</p>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <Card className={cn("max-w-3xl mx-auto shadow-lg bg-card/80 backdrop-blur-sm transition-colors", getBorderColor())}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                  <HolocronIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">Holocron 2.0</CardTitle>
                <CardDescription>
                  This IS the droid you're looking for... to test your units.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showDownloadButton && (
                <Button ref={downloadTriggerRef} variant="outline" size="icon" className="download-button">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download as Image</span>
                </Button>
              )}
              {isClient && activeTab === 'squad-builder' && (
                <Sheet open={isSavedSquadsOpen} onOpenChange={setIsSavedSquadsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isPending}>
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
              {isClient && (
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
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={isPending ? undefined : setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="unit-finder"
                disabled={isPending}
                className="data-[state=active]:bg-unit-finder-accent data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=inactive]:border-b-2 data-[state=inactive]:border-unit-finder-accent data-[state=inactive]:text-unit-finder-accent"
              >
                Unit Finder
              </TabsTrigger>
              <TabsTrigger
                value="squad-builder"
                disabled={isPending}
                className="data-[state=active]:bg-squad-builder-accent data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=inactive]:border-b-2 data-[state=inactive]:border-squad-builder-accent data-[state=inactive]:text-squad-builder-accent"
              >
                Squad Builder
              </TabsTrigger>
              <TabsTrigger
                value="test-assistant"
                disabled={isPending}
                className="data-[state=active]:bg-test-assistant-accent data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=inactive]:border-b-2 data-[state=inactive]:border-test-assistant-accent data-[state=inactive]:text-test-assistant-accent"
              >
                Test Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unit-finder" className="mt-4">
               <form action={unitFormAction} ref={unitFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="unit-query" name="query" defaultValue={unitState.query ?? ''} placeholder="e.g., 'A Rebel ship with an AOE attack' or 'A Jedi tank with counterattack'" required rows={3} className="text-base" />
                  <input type="hidden" name="loadMoreQuery" />
                  <input type="hidden" name="count" defaultValue="6" />
                </div>
                <SubmitButton
                  icon={<HolocronIcon className="mr-2 h-4 w-4" />}
                  pendingText="Searching..."
                  text="Find Units"
                  isPending={isPending}
                  className="bg-unit-finder-accent hover:bg-unit-finder-accent/90 text-white dark:text-black"
                />
              </form>
            </TabsContent>
            
            <TabsContent value="squad-builder" className="mt-4">
              <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="squad-query">Your Query</Label>
                  <Textarea onKeyDown={handleKeyDown} id="squad-query" name="query" defaultValue={squadState.squadsInput?.query ?? ''} placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'" required rows={3} className="text-base" />
                  <input type="hidden" name="loadMoreQuery" />
                  <input type="hidden" name="count" defaultValue="2" />
                </div>
                <SubmitButton
                  icon={<Users className="mr-2 h-4 w-4" />}
                  pendingText="Building..."
                  text="Build Squad"
                  isPending={isPending}
                  className="bg-squad-builder-accent hover:bg-squad-builder-accent/90 text-white dark:text-black"
                />
              </form>
            </TabsContent>

            <TabsContent value="test-assistant" className="mt-4">
              <form action={testCaseFormAction} ref={testCaseFormRef} className="space-y-4">
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="unit-details">The 'new_unit ability design'</Label>
                   <p className="text-xs text-muted-foreground">
                    You can copy and paste the ability details from the design document without naming the unit.
                  </p>
                  <Textarea onKeyDown={handleKeyDown} id="unit-details" name="unitDetails" defaultValue={testCaseState.testCaseInput?.unitDetails ?? ''} placeholder={`Basic - Destructive Rotation\nDescription: Deal Special damage to target enemy.\n\nUpgrades:\n\n+5% Damage\nDeal an additional instance of damage\n+5% Damage\nDeal an additional instance of damage\nInflict Defense Down for 1 turn\nDeal an additional instance of damage\nDuring new_unit's turn, Dark Side Bounty Hunter Attackers Stealth for 2 turns\nFinal Text: Deal Special damage to target enemy four times and inflict them with Defense Down for 1 turn.`} required rows={4} className="text-base" />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="test-case">Test Scenario (test_step)</Label>
                  <Textarea onKeyDown={handleKeyDown} id="test-case" name="testCase" defaultValue={testCaseState.testCaseInput?.testCase ?? ''} placeholder="Step: Verify if any Bonus Move is applied, it is only applied during an allies turn while performing an attack on an enemy. Test Data: Check in game during battle for the timing of the bonus move application" required rows={3} className="text-base" />
                </div>
                 <div className="grid w-full gap-1.5">
                  <Label htmlFor="expected-result">Expected Result</Label>
                  <Textarea onKeyDown={handleKeyDown} id="expected-result" name="expectedResult" defaultValue={testCaseState.testCaseInput?.expectedResult ?? ''} placeholder="If the Bonus Move is not applied during an allies turn while attacking an enemy, bug it" required rows={2} className="text-base" />
                </div>
                 <SubmitButton
                  icon={<BrainCircuit className="mr-2 h-4 w-4" />}
                  pendingText="Generating..."
                  text="Help Me Test This"
                  isPending={isPending}
                  className="bg-test-assistant-accent hover:bg-test-assistant-accent/90 text-white dark:text-black"
                />
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}
