import { ApiClient } from "@client/api/client";
import { useApiClient } from "@client/api/context";
import { throwExceptionOnFailedResponse } from "@client/api/exceptions";
import { ChatSchemaType, ChatWithMessagesSchemaType, MessageSchemaType, NewChatSchemaType, NewMessageSchemaType, UpdateChatSchemaType } from "@shared/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ClientResponse } from "hono/client";
import { produce } from "immer";

type Key<T> = (string | number)[] | ((arg: T) => (string | number)[]);

const createQueryHook = <Out, In = void>(key: Key<In>, func: (api: ApiClient, arg: In) => Promise<ClientResponse<Out>>) => (arg: In) => {
  const api = useApiClient();
  return useSuspenseQuery({
    queryKey: typeof key === 'function' ? key(arg) : key,
    queryFn: () => func(api, arg).then(r => {
      throwExceptionOnFailedResponse(r);

      return r.json() as Promise<Out>;
    }),
  });
};

export const useAuthStatus = createQueryHook(['auth'], (api) => api.auth.verify.$get());

export const useSettings = createQueryHook(['settings'], (api) => api.configuration.$get());

export const useModels = createQueryHook(['models'], (api) => api.providers.models.$get());
export const useChats = createQueryHook(['chats'], (api) => api.chats.$get());

export const useChat = createQueryHook(
  (id: number) => ['chats', id],
  (api, id) => api.chats[":chatId"].$get({ param: { chatId: id.toString() } })
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
export const useEditChatMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateChatSchemaType) => {
      const resp = await api.chats[":chatId"].$patch({
        param: { chatId: chatId.toString() },
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats', chatId], () => data);
    },
  });
};

export const useSendMessageMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewMessageSchemaType) => {
      const resp = await api.chats[":chatId"].$put({
        param: { chatId: chatId.toString() },
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats', chatId], () => data);
    },
  });
};

export const useRegenerateMessageMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId }: { messageId: number }) => {
      const resp = await api.chats[":chatId"][":messageId"].regenerate.$post({
        param: { chatId: chatId.toString(), messageId: messageId.toString() }
      });
      return resp.json();
    },
    onSuccess(data: MessageSchemaType) {
      client.setQueryData(['chats', chatId], (old: ChatWithMessagesSchemaType | undefined) => {
        if (!old) return old;

        return produce(old, (draft) => {
          draft.messages.push(data);
        });
      });
    },
  });
};

export const useDuplicateMessageMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId }: { messageId: number }) => {
      const resp = await api.chats[":chatId"][":messageId"].duplicate.$post({
        param: { chatId: chatId.toString(), messageId: messageId.toString() }
      });
      return resp.json();
    },
    onSuccess(data: MessageSchemaType) {
      client.setQueryData(['chats', chatId], (old: ChatWithMessagesSchemaType | undefined) => {
        if (!old) return old;
        return produce(old, (draft) => {
          draft.messages.push(data);
        });
      });
    },
  });
};

export const useEditMessageMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, text, regenerateResponse }: { messageId: number, text: string, regenerateResponse: boolean }) => {
      const resp = await api.chats[":chatId"][":messageId"].$patch({
        param: { chatId: chatId.toString(), messageId: messageId.toString() },
        json: {
          text,
          regenerateResponse,
        }
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats', chatId], () => data);
    },
  });
};

export const useDeleteMessageMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: number) => {
      const resp = await api.chats[":chatId"][":messageId"].$delete({
        param: { chatId: chatId.toString(), messageId: messageId.toString() },
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats', chatId], () => data);
    },
  });
};
