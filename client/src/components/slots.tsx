import { Children, cloneElement, ComponentType, FunctionComponent, isValidElement, ReactNode } from "react";

type SlotConfig = {
  required: boolean;
};

type SlotsConfigMap = Record<string, SlotConfig>;

type SlotsProps<C extends SlotsConfigMap> = {
  slots: {
    [name in keyof C]: ReactNode;
  }
};

type ComponentWithSlotsFactory<C extends SlotsConfigMap> = <P, >(name: string, Component: ComponentType<P & SlotsProps<C>>) => ComponentWithSlots<C, P>;

type SlotType = FunctionComponent<{ children?: ReactNode }> & {
  _slotName: string
};

type ComponentWithSlots<C extends SlotsConfigMap, P = {}> = ComponentType<P & { children: ReactNode }> & {
  [key in keyof C]: SlotType
};

const createSlot = (name: string): SlotType => {
  const Slot: SlotType = ({ children }) => {
    return <>
      {children}
    </>;
  };
  Slot.displayName = name;
  Slot._slotName = name;

  return Slot;
};

export type SlotsPropsFromFactory<F> = F extends ComponentWithSlotsFactory<infer C> ? SlotsProps<C> : never;

export const createComponentWithSlotsFactory = <C extends SlotsConfigMap>(config: C): ComponentWithSlotsFactory<C> => <P,>(name: string, Component: ComponentType<P & SlotsProps<C>>) => {
  const Wrapper = (({ children, ...props }: P & { children: ReactNode }) => {
    let slots = {} as SlotsProps<C>["slots"];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return null;
      const type = child.type as string | SlotType;
      if (typeof type === 'string' || !type._slotName) {
        throw new Error('only slots allowed as component children');
      }
      if (slots[type._slotName]) {
        throw new Error(`duplicate slot ${type._slotName}`);
      }
      // @ts-ignore
      slots[type._slotName] = cloneElement(child);
    });

    Object.keys(config).forEach((key) => {
      if (config[key].required && !slots[key]) {
        throw new Error(`required slot ${key} is missing`);
      }
    })

    // @ts-ignore
    return (<Component {...props} slots={slots} />);
  }) as ComponentWithSlots<C, P>;

  for (const key of Object.keys(config)) {
    // @ts-ignore can't type this properly
    Wrapper[key] = createSlot(key);

  }

  Wrapper.displayName = name || Component.displayName;
  return Wrapper;
}
