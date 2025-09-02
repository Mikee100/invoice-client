import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import invoiceReducer from './invoiceSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    invoices: invoiceReducer,
  },
});

export default store;
