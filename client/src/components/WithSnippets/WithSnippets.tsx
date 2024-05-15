import { useSnippetsNonBlocking } from '@client/api';
import { ChangeEvent, ChangeEventHandler, Children, cloneElement, ReactElement } from 'react';

export type WithSnippetsProps = {
  children: ReactElement<{ 
    onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    onValueChange?: (newVal: string) => void,
  }>;
};

export const WithSnippets = ({ children }: WithSnippetsProps) => {
  // TODO: show autocomplete for snippets that start with / or @

  const { data } = useSnippetsNonBlocking();
  const snippets = data ?? [];

  const child = Children.only(children);
  const originalOnChange = child.props.onChange;
  return cloneElement(child, {
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      const textBeforeCursor = target.value.slice(0, target.selectionStart);
      for (const snippet of snippets) {
        if (textBeforeCursor.endsWith(snippet.shortcut)) {
          console.log('Matched snippet shortcut!', snippet);
          const unfoldedText =
            textBeforeCursor.slice(0, textBeforeCursor.length - snippet.shortcut.length)
            + snippet.text
            + target.value.slice(target.selectionStart);
          console.log('Unfolded text', unfoldedText);

          target.value = unfoldedText;
        }
      }

      return originalOnChange?.(e);
    },
  });
};
