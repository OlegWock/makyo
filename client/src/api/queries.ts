import { ApiClient } from "@client/api/client";
import { useApiClient } from "@client/api/context";
import { throwExceptionOnFailedResponse } from "@client/api/exceptions";
import { PersonaInSchemaType, PersonaSchemaType } from "@server/schemas/personas";
import { SnippetInSchemaType, SnippetSchemaType } from "@server/schemas/snippets";
import { ChatSchemaType, ChatWithMessagesSchemaType, NewChatSchemaType, NewMessageSchemaType, UpdateChatSchemaType } from "@shared/api";
import { QueryClient, useMutation, useQuery, useQueryClient, UseQueryOptions, UseQueryResult, useSuspenseQuery, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { ClientResponse } from "hono/client";
import { produce } from "immer";

type Key<T> = (string | number)[] | ((arg: T) => (string | number)[]);

type Result<S, Out> = S extends true ? UseSuspenseQueryResult<Out> : UseQueryResult<Out>
type Options<S, Out> = Omit<S extends true ? UseSuspenseQueryOptions<Out> : UseQueryOptions<Out>, 'queryKey' | 'queryFn'>

const createHookFactory = <S extends boolean>(suspense: S) => <Out, In = void>(
  key: Key<In>,
  func: (api: ApiClient, arg: In) => Promise<ClientResponse<Out>>
) => (arg: In, opts: Partial<Options<S, Out>> = {}): Result<S, Out> => {
  const { apiClient: api } = useApiClient();
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


export const useOllamaModels = createSuspenseQueryHook(['ollama', 'models'], (api) => api.providers.ollama.models.$get());

// ------------------------------------------------------------------

const createMutationHook = <In, Out>({ mutation, onSuccess, invalidate }: {
  mutation: (api: ApiClient, arg: In) => Promise<ClientResponse<Out>>,
  onSuccess?: (client: QueryClient, data: Out, input: In) => void,
  invalidate?: (Array<string | number> | ((input: In, output: Out) => Array<string | number>))[],
}) => {
  return () => {
    const { apiClient: api } = useApiClient();
    const client = useQueryClient();

    return useMutation({
      mutationFn: async (payload: In) => {
        const resp = await mutation(api, payload);
        throwExceptionOnFailedResponse(resp);
        return resp.json() as Promise<Out>;
      },
      onSuccess(data: Out, input: In) {
        if (invalidate) {
          invalidate.forEach((key) => {
            const finalKey = typeof key === 'function' ? key(input, data) : key;
            client.invalidateQueries({ queryKey: finalKey });
          });
        }
        if (onSuccess) {
          return onSuccess(client, data, input);
        }
      },
    });
  };
};


export const useNewChatMutation = createMutationHook({
  mutation: (api, arg: NewChatSchemaType) => api.chats.$post({ json: arg }),
  invalidate: [
    ['chats']
  ],
  onSuccess: (client, data) => client.setQueryData<ChatSchemaType[]>(['chats'], (old) => [data, ...(old || [])]),
});

export const useDeleteChatMutation = createMutationHook({
  mutation: (api, chatId: number) => api.chats[":chatId"].$delete({
    param: { chatId: chatId.toString() }
  }),
  onSuccess(client, data, input) {
    client.setQueryData(['chats'], (old: ChatSchemaType[]) => {
      if (!old) return old;
      return old.filter(c => c.id !== input);
    });
  },
});

export const useEditChatMutation = createMutationHook({
  mutation: (api, { chatId, payload }: { chatId: number, payload: UpdateChatSchemaType }) => api.chats[":chatId"].$patch({
    param: { chatId: chatId.toString() },
    json: payload,
  }),
  onSuccess(client, data, { chatId }) {
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

export const useSendMessageMutation = createMutationHook({
  mutation: (api, { chatId, payload }: { chatId: number, payload: NewMessageSchemaType }) => api.chats[":chatId"].$put({
    param: { chatId: chatId.toString() },
    json: payload,
  }),
  onSuccess(client, data, { chatId }) {
    client.setQueryData(['chats', chatId], () => data);
  },
});

export const useRegenerateMessageMutation = createMutationHook({
  mutation: (api, { chatId, messageId }: { chatId: number, messageId: number }) => api.chats[":chatId"][":messageId"].regenerate.$post({
    param: { chatId: chatId.toString(), messageId: messageId.toString() }
  }),
  onSuccess(client, data, { chatId }) {
    client.setQueryData(['chats', chatId], (old: ChatWithMessagesSchemaType | undefined) => {
      if (!old) return old;

      return produce(old, (draft) => {
        draft.messages.push(data);
      });
    });
  },
});

export const useDuplicateMessageMutation = createMutationHook({
  mutation: (api, { chatId, messageId }: { chatId: number, messageId: number }) => api.chats[":chatId"][":messageId"].duplicate.$post({
    param: { chatId: chatId.toString(), messageId: messageId.toString() }
  }),
  onSuccess(client, data, { chatId }) {
    client.setQueryData(['chats', chatId], (old: ChatWithMessagesSchemaType | undefined) => {
      if (!old) return old;
      return produce(old, (draft) => {
        draft.messages.push(data);
      });
    });
  },
});

export const useEditMessageMutation = createMutationHook({
  mutation: (api, { chatId, payload: { messageId, text, regenerateResponse } }: { chatId: number, payload: { messageId: number, text: string, regenerateResponse: boolean } }) => {
    return api.chats[":chatId"][":messageId"].$patch({
      param: { chatId: chatId.toString(), messageId: messageId.toString() },
      json: {
        text,
        regenerateResponse,
      }
    });
  },
  onSuccess(client, data, { chatId }) {
    client.setQueryData(['chats', chatId], () => data);
  },
});

export const useDeleteMessageMutation = createMutationHook({
  mutation: (api, { chatId, messageId }: { chatId: number, messageId: number }) => api.chats[":chatId"][":messageId"].$delete({
    param: { chatId: chatId.toString(), messageId: messageId.toString() },
  }),
  onSuccess(client, data, { chatId }) {
    client.setQueryData(['chats', chatId], () => data);
  },
});

export const useNewSnippetMutation = createMutationHook({
  mutation: (api, payload: SnippetInSchemaType) => api.snippets.$put({
    json: payload,
  }),
  invalidate: [['snippets']],
  onSuccess(client, data) {
    client.setQueryData(['snippets'], (old: SnippetSchemaType[]) => [data, ...(old || [])]);
  },
});

export const useEditSnippetMutation = createMutationHook({
  mutation: (api, { snippetId, payload }: { snippetId: number, payload: Partial<SnippetInSchemaType> }) => api.snippets[":snippetId"].$patch({
    param: { snippetId: snippetId.toString() },
    json: payload,
  }),
  invalidate: [['snippets']],
  onSuccess(client, data) {
    client.setQueryData(['snippets'], (old: SnippetSchemaType[]) => {
      if (!old) return [data];
      return produce(old, (draft) => {
        const snippet = draft.find(s => s.id === data.id);
        if (snippet) {
          Object.assign(snippet, data);
        }
      });
    });
  },
});

export const useDeleteSnippetMutation = createMutationHook({
  mutation: (api, snippetId: number) => api.snippets[":snippetId"].$delete({
    param: { snippetId: snippetId.toString() },
  }),
  onSuccess(client, data) {
    client.setQueryData(['snippets'], () => data);
  },
});

export const useNewPersonaMutation = createMutationHook({
  mutation: (api, payload: PersonaInSchemaType) => api.personas.$put({
    json: payload,
  }),
  invalidate: [['personas']],
  onSuccess(client, data) {
    client.setQueryData(['personas'], (old: PersonaSchemaType[]) => [data, ...(old || [])]);
  },
});

export const useEditPersonaMutation = createMutationHook({
  mutation: (api, { personaId, payload }: { personaId: number, payload: Partial<PersonaInSchemaType> }) => {
    return api.personas[":personaId"].$patch({
      param: { personaId: personaId.toString() },
      json: payload,
    });
  },
  invalidate: [['personas']],
  onSuccess(client, data) {
    client.setQueryData(['personas'], (old: PersonaSchemaType[]) => {
      if (!old) return [data];
      return produce(old, (draft) => {
        const persona = draft.find(p => p.id === data.id);
        if (persona) {
          Object.assign(persona, data);
        }
      });
    });
  },
});

export const useDeletePersonaMutation = createMutationHook({
  mutation: (api, personaId: number) => api.personas[":personaId"].$delete({
    param: { personaId: personaId.toString() },
  }),
  onSuccess(client, data) {
    client.setQueryData(['personas'], () => data);
  },
});

export const useDeleteOllamaModelMutation = createMutationHook({
  mutation: (api, modelId: string) => api.providers.ollama.models[":modelId"].$delete({
    param: { modelId },
  }),
  invalidate: [
    ['models'],
  ],
  onSuccess(client, data) {
    client.setQueryData(['ollama', 'models'], () => data);
  },
});

