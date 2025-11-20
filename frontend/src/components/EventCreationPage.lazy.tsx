import { lazy } from 'react';

// Lazy load the heavy EventCreationPage component
export const EventCreationPage = lazy(() => import('./EventCreationPage'));