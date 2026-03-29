import { createSlice } from '@reduxjs/toolkit';
const reportSlice = createSlice({ name: 'reports', initialState: { dashboard: null, loading: false, error: null }, reducers: {} });
export default reportSlice.reducer;
