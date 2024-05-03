import { newlineToBreak } from 'mdast-util-newline-to-break';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import ReactMarkdown from 'react-markdown';
import { ComponentPropsWithoutRef } from 'react';
import type { Element } from 'hast';
import styles from './Markdown.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import clsx from 'clsx';

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


export function sequentialNewlinesPlugin(this: any) {
  // Adapted from https://codesandbox.io/s/create-react-app-forked-h3rmcy?file=/src/sequentialNewlinePlugin.js:0-774
  const data = this.data();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function add(field: string, value: any) {
    const list = data[field] ? data[field] : (data[field] = []);

    list.push(value);
  }

  add('fromMarkdownExtensions', {
    enter: {
      lineEndingBlank: function enterLineEndingBlank(this: any, token: unknown) {
        this.enter(
          {
            type: 'break',
            value: '',
            data: {},
            children: [],
          },
          token,
        );
      },
    },
    exit: {
      lineEndingBlank: function exitLineEndingBlank(this: any, token: unknown) {
        this.exit(token);
      },
    },
  });
}

function remarkBreaks() {
  return newlineToBreak;
}

const remarkPlugins = [sequentialNewlinesPlugin, remarkGfm, remarkBreaks];
const rehypePlugins = [() => rehypeExternalLinks({ target: '_blank' })];

export type MarkdownProps = {
  content: string,
  className?: string,
};

export const Markdown = ({ content, className }: MarkdownProps) => {
  return (<div className={clsx(styles.Markdown, className)}>
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      children={content}
      components={{
        code: CodeBlock,
      }}
    />
  </div>);
};
