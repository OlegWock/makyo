import { createStrictContext } from "@client/utils/context";
import { TransitionStartFunction } from "react";

export const [RouterTransitionContextProvider, useRouterTransition] = createStrictContext<{ isTransitionPending: boolean }>('RouterTransitionContext');
export const [RouterPrivateContextProvider, useRouterPrivate] = createStrictContext<TransitionStartFunction>('RouterPrivateContext');
