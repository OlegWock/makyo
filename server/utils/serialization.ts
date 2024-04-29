type Serialized<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key] extends Date ? number : T[Key]
};

export const serialize = <T extends Record<string, any>>(obj: T): Serialized<T> => {
  const copy = { ...obj } as Serialized<T>;
  for (const key in copy) {
    if (copy.hasOwnProperty(key)) {
      const value = copy[key] as any;
      if (value instanceof Date) {
        // @ts-ignore I know what I am doing
        copy[key] = value.valueOf();
      }
    }
  }
  return copy;
};

export const omit = <T extends Record<string, any>, const K extends string[]>(obj: T, keys: K): Omit<T, K[number]> => {
  const omitKeys = new Set(keys as string[]);

  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !omitKeys.has(k)),
  ) as Omit<T, K[number]>;
};
