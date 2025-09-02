import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchInvoices = createAsyncThunk('invoices/fetchInvoices', async () => {
  // TODO: Replace with real API call
  return [
    { _id: '1', clientName: 'Acme Corp', amount: 1200, status: 'pending', dueDate: '2025-09-10' },
    { _id: '2', clientName: 'Beta LLC', amount: 800, status: 'paid', dueDate: '2025-08-20' },
  ];
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchInvoices.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch invoices';
      });
  },
});

export default invoiceSlice.reducer;
