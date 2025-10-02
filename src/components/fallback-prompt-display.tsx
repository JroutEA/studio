
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FallbackPromptDisplayProps = {
  errorMessage: string;
  fallbackPrompt: string;
};

export function FallbackPromptDisplay({ errorMessage, fallbackPrompt }: FallbackPromptDisplayProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(fallbackPrompt).then(() => {
      setHasCopied(true);
      toast({
        title: 'Prompt Copied!',
        description: 'You can now paste the prompt into another AI tool.',
      });
      setTimeout(() => setHasCopied(false), 2000);
    }, (err) => {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the prompt to your clipboard.',
      });
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>AI Generation Failed</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      
      <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
              The AI model failed to generate a response. As a fallback, you can copy the full prompt below and use it in another generative AI application like Google's AI Studio.
          </p>
        <div className="relative">
          <Textarea
            readOnly
            value={fallbackPrompt}
            className="h-64 bg-background/50 font-code text-xs"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleCopy}
          >
            {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy Prompt</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
