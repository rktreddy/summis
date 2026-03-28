import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // NetInfo returns null for isConnected when it can't determine the state.
      // Default to true to avoid false offline indicators.
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  return { isConnected };
}
