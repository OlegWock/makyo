import { createCustomLocalToast, ToastComponentProps, ToastPlacement } from 'react-local-toast';
import styles from './LocalToast.module.scss';
import { Ref, useMemo } from 'react';
import clsx from 'clsx';
import { iife } from '@shared/utils';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import PuffLoader from 'react-spinners/PuffLoader';
import { Button } from '@client/components/Button';

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

const LocalToast = ({ id, style, data, ref, removeMe, animation, placement }: ToastComponentProps<ToastData>) => {
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
    <div
      className={clsx(
        styles.LocalToast,
        styles[data.type],
        styles[animation.state],
        styles[placement],
        data.type === 'confirm' && data.destructive && styles.destructive
      )}
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
    </div>
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
