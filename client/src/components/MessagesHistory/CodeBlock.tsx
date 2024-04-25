import hljs from 'highlight.js';
import { ComponentPropsWithoutRef, useEffect, useRef } from 'react';

export type CodeBlockProps = ComponentPropsWithoutRef<"code">;

export const CodeBlock = (props: CodeBlockProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-')) {
      hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
};
