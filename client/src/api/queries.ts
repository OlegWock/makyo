import { ApiClient } from "@client/api/client";
import { useApiClient } from "@client/api/context";
import { throwExceptionOnFailedResponse } from "@client/api/exceptions";
import { PersonaInSchemaType, PersonaSchemaType } from "@server/schemas/personas";
import { SnippetInSchemaType, SnippetSchemaType } from "@server/schemas/snippets";
import { ChatSchemaType, ChatWithMessagesSchemaType, MessageSchemaType, NewChatSchemaType, NewMessageSchemaType, UpdateChatSchemaType } from "@shared/api";
import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseQueryResult, useSuspenseQuery, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { ClientResponse } from "hono/client";
import { produce } from "immer";

type Key<T> = (string | number)[] | ((arg: T) => (string | number)[]);

type Result<S, Out> = S extends true ? UseSuspenseQueryResult<Out> : UseQueryResult<Out>
type Options<S, Out> = Omit<S extends true ? UseSuspenseQueryOptions<Out> : UseQueryOptions<Out>, 'queryKey' | 'queryFn'>

const createHookFactory = <S extends boolean>(suspense: S) => <Out, In = void>(
  key: Key<In>,
  func: (api: ApiClient, arg: In) => Promise<ClientResponse<Out>>
) => (arg: In, opts: Partial<Options<S, Out>> = {}): Result<S, Out> => {
  const api = useApiClient();
  // @ts-ignore
  return (suspense ? useSuspenseQuery : useQuery)({
    queryKey: typeof key === 'function' ? key(arg) : key,
    queryFn: () => func(api, arg).then(r => {
      throwExceptionOnFailedResponse(r);

      return r.json() as Promise<Out>;
    }),
    ...opts,
  });
};

const createSuspenseQueryHook = createHookFactory(true);
const createQueryHook = createHookFactory(false);

export const useAuthStatus = createSuspenseQueryHook(['auth'], (api) => api.auth.verify.$get());

export const useSettings = createSuspenseQueryHook(['settings'], (api) => api.configuration.$get());

export const useModels = createSuspenseQueryHook(['models'], (api) => api.providers.models.$get());
export const useChats = createSuspenseQueryHook(['chats'], (api) => api.chats.$get());

export const useChat = createSuspenseQueryHook(
  (id: number) => ['chats', id],
  (api, id) => api.chats[":chatId"].$get({ param: { chatId: id.toString() } })
);

export const useSearch = createSuspenseQueryHook(
  (searchQuery: string) => ['search', searchQuery],
  (api, searchQuery) => api.search.$get({ query: { searchQuery } })
);

export const useSnippets = createSuspenseQueryHook(['snippets'], (api) => api.snippets.$get());
export const useSnippetsNonBlocking = createQueryHook(['snippets'], (api) => api.snippets.$get());

export const usePersonas = createSuspenseQueryHook(['personas'], (api) => api.personas.$get())

// ------------------------------------------------------------------

// TODO: maybe create a hook factory for mutations too (like we have for queries)

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

export const useDeleteChatMutation = (chatId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await api.chats[":chatId"].$delete({
        param: { chatId: chatId.toString() }
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['chats'], (old: ChatSchemaType[]) => {
        if (!old) return old;
        return old.filter(c => c.id !== chatId);
      });
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
      client.setQueryData(['chats'], (old: ChatSchemaType[]) => {
        if (!old) return old;
        return produce(old, (draft) => {
          const chat = draft.find(c => c.id === chatId);
          if (chat) {
            Object.assign(chat, data.chat);
          }
        })
      });
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

export const useNewSnippetMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SnippetInSchemaType) => {
      const resp = await api.snippets.$put({
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['snippets'], (old: SnippetSchemaType[]) => [data, ...(old || [])]);
      client.invalidateQueries({ queryKey: ['snippets'] });
    },
  });
};

export const useEditSnippetMutation = (snippetId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SnippetInSchemaType>) => {
      const resp = await api.snippets[":snippetId"].$patch({
        param: { snippetId: snippetId.toString() },
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['snippets'], (old: SnippetSchemaType[]) => {
        if (!old) return [data];
        return produce(old, (draft) => {
          const snippet = draft.find(s => s.id === data.id);
          if (snippet) {
            Object.assign(snippet, data);
          }
        });
      });
      client.invalidateQueries({ queryKey: ['snippets'] });
    },
  });
};

export const useDeleteSnippetMutation = (snippetId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await api.snippets[":snippetId"].$delete({
        param: { snippetId: snippetId.toString() },
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['snippets'], () => data);
    },
  });
};

export const useNewPersonaMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PersonaInSchemaType) => {
      const resp = await api.personas.$put({
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['personas'], (old: PersonaSchemaType[]) => [data, ...(old || [])]);
      client.invalidateQueries({ queryKey: ['personas'] });
    },
  });
};

export const useEditPersonaMutation = (personaId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PersonaInSchemaType>) => {
      const resp = await api.personas[":personaId"].$patch({
        param: { personaId: personaId.toString() },
        json: payload,
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['personas'], (old: PersonaSchemaType[]) => {
        if (!old) return [data];
        return produce(old, (draft) => {
          const persona = draft.find(p => p.id === data.id);
          if (persona) {
            Object.assign(persona, data);
          }
        });
      });
      client.invalidateQueries({ queryKey: ['personas'] });
    },
  });
};

export const useDeletePersonaMutation = (personaId: number) => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await api.personas[":personaId"].$delete({
        param: { personaId: personaId.toString() },
      });
      return resp.json();
    },
    onSuccess(data) {
      client.setQueryData(['personas'], () => data);
    },
  });
};
