import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportAPI } from '../../services/api';

export const fetchDashboard = createAsyncThunk('reports/dashboard', async (_, { rejectWithValue }) => {
  try { const { data } = await reportAPI.get('/api/reports/dashboard'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchProjectReport = createAsyncThunk('reports/project', async (projectId, { rejectWithValue }) => {
  try { const { data } = await reportAPI.get(`/api/reports/projects/${projectId}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchWorkload = createAsyncThunk('reports/workload', async (_, { rejectWithValue }) => {
  try { const { data } = await reportAPI.get('/api/reports/workload'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: { dashboard: null, projectReport: null, workload: null, loading: false, error: null },
  reducers: { clearReport(state) { state.projectReport = null; } },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(fetchDashboard.pending, pending)
      .addCase(fetchDashboard.fulfilled, (state, { payload }) => { state.loading = false; state.dashboard = payload; })
      .addCase(fetchDashboard.rejected, rejected)
      .addCase(fetchProjectReport.pending, pending)
      .addCase(fetchProjectReport.fulfilled, (state, { payload }) => { state.loading = false; state.projectReport = payload; })
      .addCase(fetchProjectReport.rejected, rejected)
      .addCase(fetchWorkload.pending, pending)
      .addCase(fetchWorkload.fulfilled, (state, { payload }) => { state.loading = false; state.workload = payload.workload; })
      .addCase(fetchWorkload.rejected, rejected);
  },
});
export const { clearReport } = reportSlice.actions;
export default reportSlice.reducer;