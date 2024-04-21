import { useAtom } from "jotai";
import { ReactNode, useState } from "react";
import { apiKeyAtom } from "./atoms/auth";
import { useMount } from "./utils/hooks";
import { createApiClient } from "./api";

export const Auth = ({ children }: { children: ReactNode }) => {
  const [{ apiKey, lastCheck }, setApiKeyAtom] = useAtom(apiKeyAtom);
  const [isLoading, setIsLoading] = useState(false);
  
  const authenticated = !!apiKey && (Date.now() - lastCheck) < 1000 * 60 * 60 * 12;

  useMount(async () => {
    if (authenticated) return;
    while (true) {
      const localApiKey = prompt('Enter the password:');
      if (!localApiKey) continue;
      setIsLoading(true);
      try {
        const api = createApiClient(localApiKey);
        const resp = await api.auth.validate.$get();
        const json = await resp.json();
        if (!json.valid) continue;
        setIsLoading(false);
        setApiKeyAtom({
          apiKey: localApiKey,
          lastCheck: Date.now(),
        });
        break;
      } catch (err) {
        console.log(err);
      }
    }


  });

  if (isLoading) {
    return (<>Checking token</>);
  }

  if (!authenticated) {
    return (<>Not authenticated</>);
  }

  return (<>
    {children}
  </>);
};
