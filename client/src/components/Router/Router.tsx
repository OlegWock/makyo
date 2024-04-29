import { useAtom } from "jotai/react";
import { atomWithLocation } from "jotai-location";
import { ReactNode, Suspense, useTransition } from "react";
import { BaseLocationHook, Router as Wouter } from "wouter";
import { ProgressBar } from "./ProgressBar";
import { RouterPrivateContextProvider, RouterTransitionContextProvider, useRouterPrivate } from "./context";
import { Loading } from "@client/components/Loading";

const locationAtom = atomWithLocation();

const useLocationWithTransition: BaseLocationHook = () => {
  const [loc, setLoc] = useAtom(locationAtom);

  const startTransition = useRouterPrivate();

  return [
    loc.pathname ?? '/',
    (to: string, replace = false) => {
      startTransition(() => {
        setLoc({
          pathname: to,
        }, { replace });
      });
    }
  ];
};

export type RouterProps = {
  children: ReactNode;
}

export const Router = ({ children }: RouterProps) => {
  const [isPending, startTransition] = useTransition();
  console.log('Is transition pending', isPending);

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
