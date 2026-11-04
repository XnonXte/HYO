import { useContext } from 'react';
import { TalkSessionsContext, type TalkSessionsContextValue } from '../context/talkSessionsContext';

export function useTalkSessions(): TalkSessionsContextValue {
  const value = useContext(TalkSessionsContext);
  if (!value) {
    throw new Error('useTalkSessions must be used inside <TalkSessionsProvider>.');
  }
  return value;
}
