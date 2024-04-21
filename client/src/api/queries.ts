import { useApiClient } from "@client/api/context";
import { useQuery } from "@tanstack/react-query";

export const useSettings = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.configuration.$get().then(r => r.json()),
  });
};
