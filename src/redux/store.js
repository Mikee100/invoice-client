import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import invoiceReducer from './invoiceSlice';
import paymentReducer from './paymentSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.headers'],
        ignoredPaths: ['payload.headers'],
      },
    }),
});

// Named export for better tree-shaking and explicit imports
// Keep default export for backward compatibility
export default store;
// Named export for explicit imports
export { store };
