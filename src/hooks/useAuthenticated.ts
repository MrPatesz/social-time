import { useSession, UseSessionOptions } from 'next-auth/react';

export const useAuthenticated = (options?: UseSessionOptions<boolean> | undefined) => {
    const { data: session, status } = useSession(options);

    const loading = status === 'loading' && !session;
    const authenticated = status === 'authenticated' || Boolean(session);

    if (loading) {
        return { loading };
    } else if (!authenticated) {
        return { loading, authenticated };
    } else {
        return { loading, authenticated, user: session!.user };
    }
};
