import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/tasks';

// Fetch tasks by project
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}?projectId=${projectId}`);
      return res.data; // expected: array of tasks
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    kanban: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.kanban = action.payload.reduce((acc, task) => {
          if (!acc[task.status]) acc[task.status] = [];
          acc[task.status].push(task);
          return acc;
        }, {});
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // createTask
      .addCase(createTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
        if (!state.kanban[action.payload.status]) state.kanban[action.payload.status] = [];
        state.kanban[action.payload.status].push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // updateTaskStatus
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const task = action.payload;
        // remove from old status column
        Object.keys(state.kanban).forEach((key) => {
          state.kanban[key] = state.kanban[key].filter((t) => t._id !== task._id);
        });
        // add to new status
        if (!state.kanban[task.status]) state.kanban[task.status] = [];
        state.kanban[task.status].push(task);
        // update list
        const index = state.list.findIndex((t) => t._id === task._id);
        if (index >= 0) state.list[index] = task;
      })

      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((t) => t._id !== id);
        Object.keys(state.kanban).forEach((key) => {
          state.kanban[key] = state.kanban[key].filter((t) => t._id !== id);
        });
      });
  },
});

export default taskSlice.reducer;