import { newlineToBreak } from 'mdast-util-newline-to-break';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import ReactMarkdown from 'react-markdown';
import styles from './Markdown.module.scss';
import clsx from 'clsx';
import { lazy, Suspense } from 'react';


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
