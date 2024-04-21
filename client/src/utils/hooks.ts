import { useEffect } from "react";

export const useMount = (cb: () => VoidFunction | void | Promise<void>) => {
  useEffect(() => {
    const res = cb();
    if (typeof res === 'function') return res;
  }, []);
};
