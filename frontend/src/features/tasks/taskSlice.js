import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../services/api.js';
import SocketService from '../../services/socket.js';

const API_URL = 'http://localhost:3003/api/tasks';

// Fetch tasks by project
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const url = projectId ? `${API_URL}?projectId=${projectId}` : API_URL;
      const res = await taskAPI.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchKanban = createAsyncThunk(
  'tasks/fetchKanban',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await taskAPI.get(`/kanban/${projectId}`);
      return res.data; // {todo:[], inProgress:[], done:[]}
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
      const res = await taskAPI.post(API_URL, payload);
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
      const res = await taskAPI.patch(`${API_URL}/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ id, newStatus, projectId }, { rejectWithValue }) => {
    try {
      const res = await taskAPI.patch(`${API_URL}/${id}/status`, { status: newStatus });
      SocketService.joinRoom(projectId);
      SocketService.sendNotification({
        recipientId: null,
        type: 'task_moved',
        message: `Task moved to ${newStatus}`,
        projectId,
        taskId: id
      });
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
      await taskAPI.delete(`${API_URL}/${id}`);
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