import { createCustomLocalToast, ToastComponentProps, ToastPlacement } from 'react-local-toast';
import styles from './LocalToast.module.scss';
import { Ref, useMemo, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, Variants } from 'framer-motion';
import clsx from 'clsx';
import { iife } from '@shared/utils';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import PuffLoader from 'react-spinners/PuffLoader';
import { Button } from '@client/components/Button';
import { inverseLerp, lerp, minmax } from '@client/utils/animations';

type ToastDataText = {
  type: 'info' | 'success' | 'error' | 'loading';
  text: string;
};

type ToastDataConfirm = {
  type: 'confirm';
  text: string;
  onConfirm: VoidFunction;
  onCancel?: VoidFunction;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

type ToastData = ToastDataText | ToastDataConfirm;

const variants: Variants = {
  initial: (placement: ToastPlacement) => {
    if (placement === 'top' || placement === 'bottom') return { x: '-10%', opacity: 0 };
    if (placement === 'left' || placement === 'right') return { y: '-10%', opacity: 0 };

    return {};
  },
  visible: (placement: ToastPlacement) => {
    return {
      x: 0,
      y: 0,
      opacity: 1,
    };
  },
  exit: (placement: ToastPlacement) => {
    if (placement === 'top' || placement === 'bottom') return { x: '10%', opacity: 0 };
    if (placement === 'left' || placement === 'right') return { y: '10%', opacity: 0 };

    return {};
  },
};

const LocalToast = ({ id, style, data, ref, removeMe, animation, placement }: ToastComponentProps<ToastData>) => {
  const currentVariant = iife(() => {
    if (['entering', 'entered'].includes(animation.state)) return 'visible'
    if (animation.state === 'exiting') return 'exit';
  });

  const icon = useMemo(() => {
    if (data.type === 'success') return <HiOutlineCheckCircle />;
    if (data.type === 'error') return <HiOutlineExclamationCircle />;
    if (data.type === 'info') return <HiOutlineInformationCircle />;
    if (data.type === 'loading') return <PuffLoader size={32} color="var(--blue-10)" />;
    if (data.type === 'confirm' && data.destructive) return <HiOutlineExclamationTriangle />;
    if (data.type === 'confirm' && !data.destructive) return <HiOutlineQuestionMarkCircle />;
  }, [data]);

  return (<div
    key={id}
    className={styles.wrapper}
    ref={ref as Ref<HTMLDivElement>}
    style={{
      ...style,
      // @ts-ignore
      '--transition-duration': `${animation.duration}ms`,
    }}
  >
    <motion.div
      className={clsx(
        styles.LocalToast,
        styles[data.type],
        data.type === 'confirm' && data.destructive && styles.destructive
      )}
      variants={variants}
      custom={placement}
      initial="initial"
      animate={currentVariant}
      transition={{ duration: animation.duration / 1000, ease: [0.65, 0, 0.35, 1] }}
      layout={animation.state !== 'entering'}
    >
      {icon}
      <div>{data.text}</div>
      {data.type === 'confirm' && <div className={styles.actions}>
        <Button
          size='medium'
          variant={data.destructive ? 'danger' : 'primary'}
          onClick={() => {
            data.onConfirm()
            removeMe();
          }}
        >
          {data.confirmText ?? 'Confirm'}
        </Button>
        <Button
          size='medium'
          onClick={() => {
            data.onCancel?.()
            removeMe();
          }}
        >
          {data.cancelText ?? 'Cancel'}
        </Button>
      </div>}
    </motion.div>
  </div>);
};

const { Provider, Target, useCustomLocalToast } = createCustomLocalToast(LocalToast);

export const ToastProvider = Provider;
export const ToastTarget = Target;

type ToastOptions = {
  duration?: number,
  placement?: ToastPlacement,
}

export const useLocalToast = () => {
  const { addToast, removeToast, removeAllToastsByName, removeAllToasts } = useCustomLocalToast();

  const showToast = (
    name: string,
    type: ToastDataText["type"],
    text: ToastDataText["text"],
    { duration = 1500, placement }: ToastOptions = {}
  ) => {
    const id = addToast(name, { type, text }, placement);
    if (duration) setTimeout(() => removeToast(id), duration);
    return id;
  };

  const showConfirm = (
    name: string,
    text: string,
    { duration = 0, placement, ...rest }: Omit<ToastDataConfirm, 'type' | 'text'> & ToastOptions,
  ) => {
    removeAllToastsByName(name);
    const id = addToast(name, { type: 'confirm', text, ...rest }, placement);
    if (duration) setTimeout(() => removeToast(id), duration);
    return id;
  };

  return { showToast, showConfirm, addToast, removeToast, removeAllToastsByName, removeAllToasts };
};
