// src/providers/ReduxProvider.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useEffect } from 'react';
import { fetchCurrentUser } from '../redux/features/auth/authSlice';

export default function ReduxProvider({ 
  children 
}) {
  useEffect(() => {
    // Check if user is already logged in on app start
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      store.dispatch(fetchCurrentUser());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}