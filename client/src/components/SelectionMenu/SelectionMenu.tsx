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
  targetRef: RefObject<HTMLElement | null>;
  onClick: (text: string, send: boolean) => void;
};

export const SelectionMenu = ({ targetRef, onClick }: SelectionMenuProps) => {
  const handleClick = (template: string, send = true) => {
    const result = template.replaceAll('<##text##>', rangeRef.current?.toString() ?? '');
    onClick(result, send);
    setIsOpen(false);
  };

  const handleSearch = () => {
    const text = rangeRef.current?.toString();
    if (text) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
    }
    setIsOpen(false);
  };

  const isMouseDownRef = useRef(false);
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
      if (isMouseDownRef.current) return;
      const selection = document.getSelection();
      const range =
        typeof selection?.rangeCount === "number" && selection.rangeCount > 0
          ? selection.getRangeAt(0)
          : null;

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
    };

    const handlePointerDown = () => {
      isMouseDownRef.current = true;
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
      handleSelectionChange();
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('pointerup', handlePointerUp, true);
    };
  }, [refs]);

  if (isOpen) {
    return <div
      onPointerDown={e => e.stopPropagation()}
      className={styles.SelectionMenu}
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
      }}
      {...getFloatingProps()}
    >
      <button
        onClick={() => handleClick(`You said:\n\n> <##text##>\n\n`, false)}
      >
        Quote
      </button>
      <button
        onClick={() => handleClick(`Rephrase this part: "<##text##>"`)}
      >
        Rephrase
      </button>
      <button
        onClick={() => handleClick(`What is <##text##>?`)}
      >
        What is this
      </button>
      <button
        onClick={() => handleClick(`Tell me more about <##text##>.`)}
      >
        Tell me more
      </button>
      <button
        onClick={() => handleClick(`Provide examples of <##text##>.`)}
      >
        Examples
      </button>
      <button
        onClick={() => handleClick(`What are advantages of <##text##>?`)}
      >
        Advantages
      </button>
      <button
        onClick={() => handleClick(`What are disadvantages of <##text##>?`)}
      >
        Disadvantages
      </button>
      <button
        onClick={() => handleClick(`<##text##> isn't relevant here.`)}
      >
        Not relevant
      </button>
      <button onClick={handleSearch}>
        Google
      </button>
    </div>;
  }

  return null;
};
