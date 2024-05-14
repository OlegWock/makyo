import { useEffect, useLayoutEffect, useRef } from "react";

export const useMount = (cb: () => VoidFunction | void | Promise<void>) => {
  useEffect(() => {
    const res = cb();
    if (typeof res === 'function') return res;
  }, []);
};

export const usePageTitle = (title: string) => {
  document.title = `${title} | Makyo chat`;
};

export const useMirrorStateToRef = <T>(val: T) => {
  const ref = useRef(val);
  
  useLayoutEffect(() => {
    ref.current = val;
  });

  return ref;
};

export const usePrevious = <T>(val: T) => {
  const ref = useRef<T | undefined>(undefined);

  useLayoutEffect(() => {
    ref.current = val;
  });

  return ref.current;
};
