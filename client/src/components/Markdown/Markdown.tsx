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


/////////
// Adapted from https://codesandbox.io/s/create-react-app-forked-h3rmcy?file=/src/sequentialNewlinePlugin.js:0-774
function enterLineEndingBlank(this: any, token: any) {
  this.enter(
      {
          type: "break",
          value: "",
          data: {},
          children: []
      },
      token
  );
}

function exitLineEndingBlank(this: any, token: any) {
  this.exit(token);
}

/**
* MDAST utility for processing the lineEndingBlank token from micromark.
*/
const sequentialNewlinesFromMarkdown = {
  enter: {
      lineEndingBlank: enterLineEndingBlank
  },
  exit: {
      lineEndingBlank: exitLineEndingBlank
  }
};

function sequentialNewlinesPlugin(this: any) {
  const data = this.data();

  function add(field: any, value: any) {
      const list = data[field] ? data[field] : (data[field] = []);

      list.push(value);
  }

  add("fromMarkdownExtensions", sequentialNewlinesFromMarkdown);
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
