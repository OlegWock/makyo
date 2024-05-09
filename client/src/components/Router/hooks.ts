import { useRouterPrivate } from "@client/components/Router/context";
import { iife } from "@shared/utils";
import { useAtom } from "jotai/react";
import { atom } from "jotai/vanilla";
import { useMemo } from "react";
import { BaseLocationHook, useSearch } from "wouter";


type JotaiLocation = {
  pathname: string;
  params: Record<string, string>;
};

type JotaiLocationSetPayload = string | {
  pathname?: string;
  params?: Record<string, string>;
};

type JotaiLocationSetOptions = {
  replace?: boolean;
};

const searchParamsToMap = (sp: URLSearchParams) => {
  const result: Record<string, string> = {};
  for (const [key, val] of sp.entries()) {
    result[key] = val;
  }
  return result;
}

const atomWithLocation = () => {
  const storage = atom<JotaiLocation>({
    pathname: location.pathname,
    params: searchParamsToMap(new URLSearchParams(location.search)),
  });

  storage.onMount = (set) => {
    const handler = () => {
      set({
        pathname: location.pathname,
        params: searchParamsToMap(new URLSearchParams(location.search)),
      });
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  };
  return atom<JotaiLocation, [JotaiLocationSetPayload, JotaiLocationSetOptions] | [JotaiLocationSetPayload], void>(
    (get) => get(storage),
    (get, set, ...[payload, options]) => {
      const finalUrl = iife(() => {
        if (typeof payload === 'string') return payload;
        if (payload.pathname) {
          if (payload.params) {
            return `${payload.pathname}?${new URLSearchParams(payload.params).toString()}`;
          }
          return payload.pathname;
        }

        const currentLocation = get(storage);
        const urlParams = new URLSearchParams(payload.params);
        if (urlParams.size === 0) return currentLocation.pathname;
        return `${currentLocation.pathname}?${urlParams.toString()}`;
      });

      if (options?.replace) history.replaceState({}, '', finalUrl);
      else history.pushState({}, '', finalUrl);
      const url = new URL(finalUrl, location.origin);
      set(storage, {
        pathname: url.pathname,
        params: searchParamsToMap(url.searchParams),
      })
    },
  )
};

const locationAtom = atomWithLocation();

export const useLocationWithTransition: BaseLocationHook = () => {
  const [loc, setLoc] = useAtom(locationAtom);

  const startTransition = useRouterPrivate();

  return [
    loc.pathname ?? '/',
    (to: string, ...args) => {
      startTransition(() => {
        setLoc(to);
      });
    }
  ];
};

export const useSearchParams = () => {
  const [loc, setLoc] = useAtom(locationAtom);

  const setParams = (params: Record<string, { toString: () => string }>, overwrite = false) => {
    const finalParams: Record<string, string> = {
      ...(overwrite ? {} : loc.params),
    }
    Object.entries(params).forEach(([key, val]) => {
      const converted = val.toString();
      if (converted) finalParams[key] = converted;
      else delete finalParams[key];
    });

    setLoc({ params: finalParams }, { replace: true });
  };

  return [loc.params, setParams] as const;
};
