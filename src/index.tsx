import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotiBoostClient, NotiBoostConfig, Event, User, ChannelData, UserPreferences, NotiBoostError } from '@notiboost/browser-sdk';

interface NotiBoostContextType {
  client: NotiBoostClient;
  ingestEvent: (event: Event) => Promise<any>;
  ingestEventBatch: (events: Event[]) => Promise<any>;
  createUser: (user: User) => Promise<any>;
  getUser: (userId: string) => Promise<any>;
  updateUser: (userId: string, data: Partial<User>) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  setChannelData: (userId: string, channelData: ChannelData) => Promise<any>;
  setPreferences: (userId: string, preferences: UserPreferences) => Promise<any>;
  loading: boolean;
  error: NotiBoostError | null;
}

const NotiBoostContext = createContext<NotiBoostContextType | undefined>(undefined);

interface NotiBoostProviderProps {
  children: ReactNode;
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export function NotiBoostProvider({
  children,
  apiKey,
  baseURL,
  timeout,
  retries
}: NotiBoostProviderProps) {
  const [client] = useState(() => new NotiBoostClient({
    apiKey,
    baseURL,
    timeout,
    retries
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NotiBoostError | null>(null);

  const handleRequest = useCallback(async <T,>(requestFn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      const notiBoostError = err instanceof NotiBoostError 
        ? err 
        : new NotiBoostError(err instanceof Error ? err.message : 'Unknown error', 0);
      setError(notiBoostError);
      throw notiBoostError;
    } finally {
      setLoading(false);
    }
  }, []);

  const ingestEvent = useCallback((event: Event) => {
    return handleRequest(() => client.events.ingest(event));
  }, [client, handleRequest]);

  const ingestEventBatch = useCallback((events: Event[]) => {
    return handleRequest(() => client.events.ingestBatch(events));
  }, [client, handleRequest]);

  const createUser = useCallback((user: User) => {
    return handleRequest(() => client.users.create(user));
  }, [client, handleRequest]);

  const getUser = useCallback((userId: string) => {
    return handleRequest(() => client.users.get(userId));
  }, [client, handleRequest]);

  const updateUser = useCallback((userId: string, data: Partial<User>) => {
    return handleRequest(() => client.users.update(userId, data));
  }, [client, handleRequest]);

  const deleteUser = useCallback((userId: string) => {
    return handleRequest(() => client.users.delete(userId));
  }, [client, handleRequest]);

  const setChannelData = useCallback((userId: string, channelData: ChannelData) => {
    return handleRequest(() => client.users.setChannelData(userId, channelData));
  }, [client, handleRequest]);

  const setPreferences = useCallback((userId: string, preferences: UserPreferences) => {
    return handleRequest(() => client.users.setPreferences(userId, preferences));
  }, [client, handleRequest]);

  const value: NotiBoostContextType = {
    client,
    ingestEvent,
    ingestEventBatch,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    setChannelData,
    setPreferences,
    loading,
    error
  };

  return (
    <NotiBoostContext.Provider value={value}>
      {children}
    </NotiBoostContext.Provider>
  );
}

export function useNotiBoost(): NotiBoostContextType {
  const context = useContext(NotiBoostContext);
  if (!context) {
    throw new Error('useNotiBoost must be used within NotiBoostProvider');
  }
  return context;
}

interface UseEventReturn {
  ingest: (event: Event) => Promise<any>;
  loading: boolean;
  error: NotiBoostError | null;
}

export function useEvent(): UseEventReturn {
  const { ingestEvent, loading, error } = useNotiBoost();
  return {
    ingest: ingestEvent,
    loading,
    error
  };
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: NotiBoostError | null;
  update: (data: Partial<User>) => Promise<any>;
  setChannelData: (channelData: ChannelData) => Promise<any>;
  refresh: () => Promise<void>;
}

export function useUser(userId: string): UseUserReturn {
  const { getUser, updateUser, setChannelData: setUserChannelData } = useNotiBoost();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NotiBoostError | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const userData = await getUser(userId);
      setUser(userData);
    } catch (err) {
      const notiBoostError = err instanceof NotiBoostError 
        ? err 
        : new NotiBoostError(err instanceof Error ? err.message : 'Unknown error', 0);
      setError(notiBoostError);
    } finally {
      setLoading(false);
    }
  }, [userId, getUser]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(async (data: Partial<User>) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await updateUser(userId, data);
      await refresh();
    } catch (err) {
      const notiBoostError = err instanceof NotiBoostError 
        ? err 
        : new NotiBoostError(err instanceof Error ? err.message : 'Unknown error', 0);
      setError(notiBoostError);
      throw notiBoostError;
    } finally {
      setLoading(false);
    }
  }, [userId, updateUser, refresh]);

  const setChannelData = useCallback(async (channelData: ChannelData) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await setUserChannelData(userId, channelData);
      await refresh();
    } catch (err) {
      const notiBoostError = err instanceof NotiBoostError 
        ? err 
        : new NotiBoostError(err instanceof Error ? err.message : 'Unknown error', 0);
      setError(notiBoostError);
      throw notiBoostError;
    } finally {
      setLoading(false);
    }
  }, [userId, setUserChannelData, refresh]);

  return {
    user,
    loading,
    error,
    update,
    setChannelData,
    refresh
  };
}

export * from '@notiboost/browser-sdk';

