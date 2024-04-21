import { createApiClient } from '@client/api/client';
import { createStrictContext } from '@client/utils/context';

export const [AuthProvider, useApiClient] = createStrictContext<ReturnType<typeof createApiClient>>('AuthContext');
