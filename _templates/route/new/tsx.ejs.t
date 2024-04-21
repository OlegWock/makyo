---
to: client/src/routes/<%= name %>/<%= name %>.tsx
---

import styles from './<%= name %>.module.scss';

export const <%= name %> = () => {
  return (<div className={styles.<%= name %>}><%= name %></div>);
};
