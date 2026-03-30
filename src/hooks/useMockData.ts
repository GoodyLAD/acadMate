import { useState, useEffect } from 'react';
import {
  isMockDataLoaded,
  setMockDataLoaded,
  clearMockDataFlag,
} from '@/services/mockDataService';

export const useMockData = () => {
  const [mockDataEnabled, setMockDataEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    setMockDataEnabled(isMockDataLoaded());

    // Listen for changes
    const handleStorageChange = () => {
      setMockDataEnabled(isMockDataLoaded());
    };

    // Listen for custom events (for same-tab updates)
    const handleMockDataChange = () => {
      setMockDataEnabled(isMockDataLoaded());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mockDataChanged', handleMockDataChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mockDataChanged', handleMockDataChange);
    };
  }, []);

  const enableMockData = () => {
    setMockDataLoaded(true);
    setMockDataEnabled(true);
    window.dispatchEvent(new CustomEvent('mockDataChanged'));
  };

  const disableMockData = () => {
    clearMockDataFlag();
    setMockDataEnabled(false);
    window.dispatchEvent(new CustomEvent('mockDataChanged'));
  };

  return {
    mockDataEnabled,
    enableMockData,
    disableMockData,
  };
};
