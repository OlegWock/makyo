import { CSSProperties } from "react";

export default {
  "code[class*=\"language-\"]": {
      "color": "#100a08",
      "fontFamily": `'Source Code Pro', Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace`,
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "normal",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none"
  },
  "pre[class*=\"language-\"]": {
      "color": "white",
      "fontFamily": "Consolas, Monaco, \"Andale Mono\", \"Ubuntu Mono\", monospace",
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "normal",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none",
      "padding": "1em",
      "margin": "0.5em 0",
      "overflow": "auto",
      "background": "#f3eae3"
  },
  "pre[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "pre[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "code[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "code[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "pre[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "pre[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "code[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  "code[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#bd4f274d"
  },
  ":not(pre) > code[class*=\"language-\"]": {
      "color": "white",
      "background": "#f3eae3",
      "padding": "0.1em",
      "borderRadius": "0.3em",
      "whiteSpace": "normal"
  },
  "variable": {
      "color": "#dd7404"
  },
  "attr-name": {
      "color": "#dd7404"
  },
  "selector": {
      "color": "#dd7404"
  },
  "property": {
      "color": "#dd7404"
  },
  "number": {
      "color": "#dd7404"
  },
  "builtin": {
      "color": "#9244ec"
  },
  "comment": {
      "color": "#1209068c",
      "fontStyle": "italic"
  },
  "string": {
      "color": "#1209068c",
      "fontStyle": "italic"
  },
  "punctuation": {
      "color": "#100a08"
  },
  "keyword": {
      "color": "#100a08"
  },
  "operator": {
      "color": "#100a08"
  },
  "constant": {
      "color": "#df3c3c"
  },
  "hexcode": {
      "color": "#df3c3c"
  },
  "char": {
      "color": "#000000"
  },
  "function": {
      "color": "#dd39bf"
  },
  "tag": {
      "color": "#d49408"
  },
  "class-name": {
      "color": "#00aaaa"
  },
  "url": {
      "color": "#18ac31"
  },
  "symbol": {
      "color": "#18ac31"
  },
  "important": {
      "fontWeight": "bold"
  },
  "bold": {
      "fontWeight": "bold"
  },
  "italic": {
      "fontStyle": "italic"
  }
} as Record<string, CSSProperties>;
