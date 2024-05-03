
import { ReactNode, Suspense, useTransition } from "react";
import { Router as Wouter } from "wouter";
import { ProgressBar } from "./ProgressBar";
import { RouterPrivateContextProvider, RouterTransitionContextProvider } from "./context";
import { Loading } from "@client/components/Loading";
import { useLocationWithTransition } from "@client/components/Router/hooks";


export type RouterProps = {
  children: ReactNode;
}

export const Router = ({ children }: RouterProps) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Suspense fallback={<Loading />}>
      <RouterPrivateContextProvider value={startTransition}>
        <RouterTransitionContextProvider value={{ isTransitionPending: isPending }}>
          <Wouter hook={useLocationWithTransition}>
            <ProgressBar />
            {children}
          </Wouter>
        </RouterTransitionContextProvider>
      </RouterPrivateContextProvider>
    </Suspense>
  );
};
