"use client";

import { useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Staatliches&display=swap";

export function useDownloadImage(
  contentRef: React.RefObject<HTMLElement>,
  triggerRef: React.RefObject<HTMLButtonElement> | undefined,
  filename: string
) {
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    if (!contentRef.current) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Content to download could not be found.',
      });
      return;
    }

    try {
      const fontResponse = await fetch(FONT_URL);
      const fontCss = await fontResponse.text();

      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: 'hsl(224 71% 4%)',
        fontEmbedCSS: fontCss,
        filter: (node: HTMLElement) => {
            // Exclude the download button from the capture
            if (node.classList?.contains('download-button')) {
                return false;
            }
            return true;
        },
      });

      const link = document.createElement('a');
      const safeFilename = filename.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      link.download = `${safeFilename}.png`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download image', err);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate the image. Please try again.',
      });
    }
  }, [contentRef, filename, toast]);

  useEffect(() => {
    const triggerElement = triggerRef?.current;
    if (triggerElement) {
      triggerElement.addEventListener('click', handleDownload);
    }

    return () => {
      if (triggerElement) {
        triggerElement.removeEventListener('click', handleDownload);
      }
    };
  }, [triggerRef, handleDownload]);
}
