export const safeCall = (cb: VoidFunction) => {
  try {
    cb();
  } catch (err) {
    console.log(err);
  }
};

export function throttle<A extends any[], R>(func: (...args: A) => R, timeFrame: number) {
  let lastTime = 0;
  return function (...args: A) {
    const now = Date.now();
    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}
