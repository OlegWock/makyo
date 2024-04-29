import { useRouterTransition } from './context';
import styles from './ProgressBar.module.scss';
import { useLayoutEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { getRandomInt } from '@shared/utils';

const transition = { type: 'spring', stiffness: 500, damping: 33, mass: 1 } as const;

export const ProgressBar = () => {
  const { isTransitionPending } = useRouterTransition();

  const timerRefs = useRef<Timer[]>([]);
  const progress = useMotionValue(0);
  const opacity = useMotionValue(1);
  const progressPercent = useTransform(progress, (v) => v + '%');

  useLayoutEffect(() => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];

    if (isTransitionPending) {
      const animateProgress = () => {
        timerRefs.current.push(setTimeout(() => {
          const toAdd = progress.get() === 0 ? getRandomInt(8, 32) : getRandomInt(3, 18);
          const newValue = Math.min(progress.get() + toAdd, 97);
          animate(progress, newValue, transition);
          timerRefs.current.push(setTimeout(animateProgress, getRandomInt(700, 1800)));
        }, 40));
      };
      animateProgress();
    } else {
      if (progress.get() !== 0) {
        animate(progress, 100, transition).then(() => {
          return animate(opacity, 0, { duration: 0.2 });
        }).then(() => {
          progress.jump(0);
          opacity.jump(1);
        });
      }
    }
  }, [isTransitionPending]);
  return (<motion.div
    style={{
      opacity
    }}
    className={styles.root}
  >
    <motion.div
      className={styles.bar}
      style={{
        width: progressPercent
      }}
    >
      <motion.div className={styles.highlight} />
    </motion.div>
  </motion.div>)
};
