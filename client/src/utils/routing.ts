import { useMemo } from "react";
import { useParams } from "wouter";
import { z } from "zod";

export const useStrictRouteParams = <T extends z.ZodRawShape>(shape: T): z.infer<z.ZodObject<T>> => {
  const params = useParams();
  const matching = useMemo(() => z.object(shape).parse(params), [params]);

  return matching;
};
