import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ComponentPropsWithoutRef } from 'react';
import type { Element } from 'hast';

export type CodeBlockProps = ComponentPropsWithoutRef<"code"> & { node?: Element | undefined };

export const CodeBlock = (props: CodeBlockProps) => {
  const { children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      children={String(children).replace(/\n$/, '')}
      language={match[1]}
      style={oneDark}
      codeTagProps={{ style: { fontFamily: `'Source Code Pro', Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace` } }}
    />
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
};
