---
to: client/src/components/<%= name %>/<%= name %>.tsx
---

import styles from './<%= name %>.module.scss';

export type <%= name %>Props = {

};

export const <%= name %> = ({}: <%= name %>Props) => {
  return (<div className={styles.<%= name %>}><%= name %></div>);
};
