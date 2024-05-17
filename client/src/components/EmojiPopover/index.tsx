import { lazy, Suspense } from 'react';
import type { EmojiPopoverProps } from '@client/components/EmojiPopover/EmojiPopover';

const LazyEmojiPopover = lazy(() => import('./EmojiPopover').then((m) => ({default: m.EmojiPopover})));

export const EmojiPopover = (props: EmojiPopoverProps) => {
  return (<Suspense fallback='Loading EmojiPopover component...'>
    <LazyEmojiPopover {...props} />
  </Suspense>)
}

