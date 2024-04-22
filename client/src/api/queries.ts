import { ApiClient } from "@client/api/client";
import { useApiClient } from "@client/api/context";
import { ChatSchemaType, NewChatSchemaType, NewMessageSchemaType } from "@shared/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ClientResponse } from "hono/client";

type Key<T> = (string | number)[] | ((arg: T) => (string | number)[]);

const createQueryHook = <Out, In = void>(key: Key<In>, func: (api: ApiClient, arg: In) => Promise<ClientResponse<Out>>) => (arg: In) => {
  const api = useApiClient();
  return useSuspenseQuery({
    queryKey: typeof key === 'function' ? key(arg) : key,
    queryFn: () => func(api, arg).then(r => r.json()),
  });
};

export const useSettings = createQueryHook(['settings'], (api) => api.configuration.$get());

export const useModels = createQueryHook(['models'], (api) => api.providers.models.$get());
export const useChats = createQueryHook(['chats'], (api) => api.chats.$get());

export const useChat = createQueryHook(
  (id: number) => ['chats', id],
  (api, id) => api.chats[":id"].$get({ param: { id: id.toString() } })
);

export const useNewChatMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewChatSchemaType) => {
      const resp = await api.chats.$post({
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats'], (old: ChatSchemaType[]) => [data, ...(old || [])]);
      client.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useChatMessagesMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewMessageSchemaType) => {
      const resp = await api.chats[":id"].$put({
        param: { id: chatId.toString() },
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats', chatId], () => data);
      // client.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
