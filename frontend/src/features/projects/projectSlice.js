import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectAPI } from '../../services/api';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await projectAPI.get('/api/projects', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchCategories = createAsyncThunk('projects/fetchCategories', async (_, { rejectWithValue }) => {
  try { const { data } = await projectAPI.get('/api/categories'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createProject = createAsyncThunk('projects/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await projectAPI.post('/api/projects', payload); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur création'); }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try { const { data } = await projectAPI.put(`/api/projects/${id}`, payload); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur mise à jour'); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { await projectAPI.delete(`/api/projects/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur suppression'); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: { list: [], categories: [], pagination: null, loading: false, error: null },
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(fetchProjects.pending, pending)
      .addCase(fetchProjects.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload.projects; state.pagination = payload.pagination; })
      .addCase(fetchProjects.rejected, rejected)
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.categories = payload.categories; })
      .addCase(createProject.pending, pending)
      .addCase(createProject.fulfilled, (state, { payload }) => { state.loading = false; state.list.unshift(payload.project); })
      .addCase(createProject.rejected, rejected)
      .addCase(updateProject.fulfilled, (state, { payload }) => { state.list = state.list.map((p) => p._id === payload.project._id ? payload.project : p); })
      .addCase(deleteProject.fulfilled, (state, { payload }) => { state.list = state.list.filter((p) => p._id !== payload); });
  },
});
export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;