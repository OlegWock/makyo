import React, { ReactNode, useLayoutEffect, useState } from 'react';
import {
  Root as RadixSelectRoot,
  SelectTrigger as RadixSelectTrigger,
  SelectValue as RadixSelectValue,
  SelectIcon as RadixSelectIcon,
  SelectContent as RadixSelectContent,
  SelectScrollUpButton as RadixSelectScrollUpButton,
  SelectViewport as RadixSelectViewport,
  SelectScrollDownButton as RadixSelectScrollDownButton,
  SelectItem as RadixSelectItem,
  SelectItemText as RadixSelectItemText,
  SelectItemIndicator as RadixSelectItemIndicator,
  SelectPortal as RadixSelectPortal
} from '@radix-ui/react-select';
import type { SelectItemProps } from '@radix-ui/react-select';
import classnames, { clsx } from 'clsx';
import styles from './Select.module.scss';
import { HiCheck, HiChevronDown, HiChevronUp } from 'react-icons/hi2';


export type SelectProps<T> = {
  options: T[] | readonly T[],
  getOptionKey: (opt: T) => string,
  getOptionLabel: (opt: T) => ReactNode,
  value: T,
  onChange: (newVal: T) => void,
  placeholder?: string,
  triggerClassname?: string,
  contentClassname?: string,
};

export const Select = <T,>({ options, value, onChange, placeholder = 'Select...', getOptionKey, getOptionLabel, triggerClassname, contentClassname }: SelectProps<T>) => {
  const innerOnChange = (newVal: string) => {
    const option = options.find(o => getOptionKey(o) === newVal);
    if (option === undefined) throw new Error('Value not found in selects options');

    onChange(option);
  };

  const [innerValue, setInnerValue] = useState(getOptionKey(value));

  useLayoutEffect(() => {
    setInnerValue(getOptionKey(value));
  }, [value]);

  return (
    <RadixSelectRoot value={innerValue} onValueChange={innerOnChange}>
      <RadixSelectTrigger className={clsx(styles.SelectTrigger, triggerClassname)} aria-label={placeholder}>
        <span className={styles.SelectValue}>
          <RadixSelectValue placeholder={placeholder} />
        </span>
        <RadixSelectIcon className={styles.SelectIcon}>
          <HiChevronDown />
        </RadixSelectIcon>
      </RadixSelectTrigger>
      <RadixSelectPortal>
        <RadixSelectContent className={clsx(styles.SelectContent, contentClassname)} position='popper'>
          <RadixSelectScrollUpButton className={styles.SelectScrollButton}>
            <HiChevronUp />
          </RadixSelectScrollUpButton>
          <RadixSelectViewport className={styles.SelectViewport}>
            {options.map(o => {
              const key = getOptionKey(o);
              return (<SelectItem value={key} key={key}>{getOptionLabel(o)}</SelectItem>);
            })}
          </RadixSelectViewport>
          <RadixSelectScrollDownButton className={styles.SelectScrollButton}>
            <HiChevronDown />
          </RadixSelectScrollDownButton>
        </RadixSelectContent>
      </RadixSelectPortal>
    </RadixSelectRoot>
  );
};


const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelectItem className={classnames(styles.SelectItem, className)} {...props} ref={forwardedRef}>
      <RadixSelectItemText>{children}</RadixSelectItemText>
      <RadixSelectItemIndicator className={styles.SelectItemIndicator}>
        <HiCheck />
      </RadixSelectItemIndicator>
    </RadixSelectItem>
  );
});
