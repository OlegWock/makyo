import { ComponentType, FunctionComponent } from "react";

export type HigherOrderComponentFactory<O extends string = never> = <P = {}>(Component: ComponentType<P>) => FunctionComponent<Omit<P, O>>;
