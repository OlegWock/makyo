import { newlineToBreak } from 'mdast-util-newline-to-break';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';

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

export const remarkPlugins = [sequentialNewlinesPlugin, remarkGfm, remarkBreaks];
export const rehypePlugins = [() => rehypeExternalLinks({target: '_blank'})];
