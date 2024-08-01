import { ApiClient } from '@client/api/client';
import { createStrictContext } from '@client/utils/context';

export const [AuthProvider, useApiClient] = createStrictContext<{ apiClient: ApiClient, logOut: () => Promise<void> }>('AuthContext');
