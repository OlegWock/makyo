import { newlineToBreak } from 'mdast-util-newline-to-break';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import styles from './Markdown.module.scss';
import clsx from 'clsx';
import { lazy, memo, Ref, Suspense, useMemo } from 'react';


const LazyCodeBlock = lazy(() => import('./CodeBlock').then(m => ({ default: m.CodeBlock })));
const CodeBlock = (props: any) => {
  return <Suspense fallback="Loading CodeBlock component...">
    <LazyCodeBlock {...props} />
  </Suspense>
}

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

// LaTeX parsing fix (mainly for ChatGPT) taken from LibreChat. Thanks!
// https://github.com/danny-avila/LibreChat

// Regex to check if the processed content contains any potential LaTeX patterns
const containsLatexRegex = /\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$|\\begin\{equation\}.*?\\end\{equation\}/;
// Regex for inline and block LaTeX expressions
const inlineLatex = new RegExp(/\\\((.+?)\\\)/, 'g');
// const blockLatex = new RegExp(/\\\[(.*?)\\\]/, 'gs');
const blockLatex = new RegExp(/\\\[(.*?[^\\])\\\]/, 'gs');

const pathLatex = (content: string) => {
  // Escape dollar signs followed by a digit or space and digit
  let processedContent = content.replace(/(\$)(?=\s?\d)/g, '\\$');

  // If no LaTeX patterns are found, return the processed content
  if (!containsLatexRegex.test(processedContent)) {
    return processedContent;
  }

  // Convert LaTeX expressions to a markdown compatible format
  processedContent = processedContent
    .replace(inlineLatex, (match: string, equation: string) => `$${equation}$`) // Convert inline LaTeX
    .replace(blockLatex, (match: string, equation: string) => `$$${equation}$$`); // Convert block LaTeX

  return processedContent;
};

const remarkPlugins = [sequentialNewlinesPlugin, remarkGfm, remarkBreaks, remarkMath];
const rehypePlugins = [rehypeKatex, () => rehypeExternalLinks({ target: '_blank' })];

export type MarkdownProps = {
  content: string,
  className?: string,
  ref?: Ref<HTMLDivElement>,
};

export const Markdown = memo(({ content, className, ref }: MarkdownProps) => {
  const patchedContent = useMemo(() => pathLatex(content), [content]);
  return (<div className={clsx(styles.Markdown, className)} ref={ref}>
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      children={patchedContent}
      components={{
        code: CodeBlock,
      }}
    />
  </div>);
});
