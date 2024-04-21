import { ApiClient } from "@client/api/client";
import { useApiClient } from "@client/api/context";
import { ConfigurationUpdateSchemaType } from "@shared/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ClientResponse } from "hono/client";

const createQueryHook = <T,>(key: string[], func: (api: ApiClient) => Promise<ClientResponse<T>>) => () => {
  const api = useApiClient();
  return useSuspenseQuery({
    queryKey: key,
    queryFn: () => func(api).then(r => r.json()),
  });
};

export const useSettings = createQueryHook(['settings'], (api) => api.configuration.$get());

export const useSettingsMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConfigurationUpdateSchemaType) => {
      const resp = await api.configuration.$patch({
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
        client.setQueryData(['settings'], data);
    },
  });
};
