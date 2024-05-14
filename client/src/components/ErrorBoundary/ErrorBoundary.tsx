import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import styles from './ErrorBoundary.module.scss';
import { ComponentType, ReactNode } from "react";
import { HigherOrderComponentFactory } from "@client/utils/react";

const FallbackComponent = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (<div className={styles.FallbackComponent}>
    <div>Oopsie, error happened {error.toString()}</div>
  </div>);
};

export type ErrorBoundaryProps = {
  children: ReactNode
};

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (<ReactErrorBoundary
    FallbackComponent={FallbackComponent}
  >
    {children}
  </ReactErrorBoundary>);
};

export const withErrorBoundary: HigherOrderComponentFactory = <P = {}>(Component: ComponentType<P>) => {
  const WithErrorBoundary = (props: P & JSX.IntrinsicAttributes) => {
    return <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  };

  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName})`;

  return WithErrorBoundary;
}
