import {
  useFloating,
  useDismiss,
  useInteractions,
  flip,
  shift,
  offset,
  inline,
  autoUpdate
} from "@floating-ui/react";
import { RefObject, useEffect, useRef, useState } from "react";
import styles from './SelectionMenu.module.scss';

export type SelectionMenuProps = {
  targetRef: RefObject<HTMLElement>;
  onClick: (text: string, send: boolean) => void;
};

export const SelectionMenu = ({ targetRef, onClick }: SelectionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rangeRef = useRef<Range | null>(null);
  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom",
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [inline(), flip(), shift(), offset({ mainAxis: 8 })],
    whileElementsMounted: autoUpdate
  });

  const { getFloatingProps } = useInteractions([
    useDismiss(context)
  ]);


  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      const range =
        typeof selection?.rangeCount === "number" && selection.rangeCount > 0
          ? selection.getRangeAt(0)
          : null;

      console.log('Selection', selection, 'range', range);
      if (selection?.isCollapsed || !range || !targetRef.current || !targetRef.current.contains(range.commonAncestorContainer)) {
        setIsOpen(false);
        return;
      }

      refs.setReference({
        getBoundingClientRect: () => range.getBoundingClientRect(),
        getClientRects: () => range.getClientRects()
      });
      rangeRef.current = range;
      setIsOpen(true);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [refs]);

  if (isOpen) {
    return <div
      className={styles.SelectionMenu}
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
      }}
      {...getFloatingProps()}
    >
      <button
        onClick={() => {
          onClick(`You said:\n\n> ${rangeRef.current?.toString()}\n\n`, false);
          setIsOpen(false);
        }}
      >
        Quote
      </button>
      <button
        onClick={() => {
          onClick(`Rephrase this part: "${rangeRef.current?.toString()}".`, true);
          setIsOpen(false);
        }}
      >
        Rephrase
      </button>
      <button
        onClick={() => {
          onClick(`What is ${rangeRef.current?.toString()}?`, true);
          setIsOpen(false);
        }}
      >
        What is this
      </button>
      <button
        onClick={() => {
          onClick(`Tell me more about ${rangeRef.current?.toString()}.`, true);
          setIsOpen(false);
        }}
      >
        Tell me more
      </button>
      <button
        onClick={() => {
          onClick(`Provide examples of ${rangeRef.current?.toString()}.`, true);
          setIsOpen(false);
        }}
      >
        Examples
      </button>
      <button
        onClick={() => {
          onClick(`What are advantages of ${rangeRef.current?.toString()}?`, true);
          setIsOpen(false);
        }}
      >
        Advantages
      </button>
      <button
        onClick={() => {
          onClick(`What are disadvantages of ${rangeRef.current?.toString()}?`, true);
          setIsOpen(false);
        }}
      >
        Disadvantages
      </button>
      <button
        onClick={() => {
          onClick(`${rangeRef.current?.toString()} isn't relevant here.`, true);
          setIsOpen(false);
        }}
      >
        Not relevant
      </button>
    </div>;
  }

  return null;
};
