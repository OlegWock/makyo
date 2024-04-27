import { ClientResponse } from "hono/client";

class HTTPError extends Error {
  constructor(response: ClientResponse<any>) {
    super(`HTTP error code ${response.status} while requesting ${response.url}`);
  }
}

export class HTTP400Error extends HTTPError {}
export class NotFoundError extends HTTP400Error {}
export class BadRequestError extends HTTP400Error {}

export class HTTP500Error extends HTTPError {}
export class InternalServerError extends HTTP500Error {}

export const throwExceptionOnFailedResponse = (res: ClientResponse<any>) => {
  if (res.status === 404) throw new NotFoundError(res);
  if (res.status === 400) throw new BadRequestError(res);
  if (res.status >= 400 && res.status < 500) throw new HTTP400Error(res);

  if (res.status === 500) throw new InternalServerError(res);
  if (res.status >= 500 && res.status < 600) throw new HTTP500Error(res);
}
