import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// ─── Thunks ───────────────────────────────────────────────────────

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.post('/api/auth/register', credentials);
      localStorage.setItem('token', data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.post('/api/auth/login', credentials);
      localStorage.setItem('token', data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.get('/api/auth/me');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

export const getUsers = createAsyncThunk(
  'auth/getUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.get('/api/users', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const blockUser = createAsyncThunk(
  'auth/blockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.patch(`/api/users/${userId}/block`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'auth/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.patch(`/api/users/${userId}/unblock`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to unblock user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await authAPI.delete(`/api/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:       null,
    token:      localStorage.getItem('token'),
    users:      [],
    pagination: null,
    loading:    false,
    error:      null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // helper
    const pending  = (state)        => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // register
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload.user;
        state.token   = payload.token;
      })
      .addCase(register.rejected, rejected)

      // login
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload.user;
        state.token   = payload.token;
      })
      .addCase(login.rejected, rejected)

      // getMe
      .addCase(getMe.pending, pending)
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload.user;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user    = null;
        state.token   = null;
        localStorage.removeItem('token');
      })

      // getUsers
      .addCase(getUsers.pending, pending)
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.users      = payload.users;
        state.pagination = payload.pagination;
      })
      .addCase(getUsers.rejected, rejected)

      // blockUser / unblockUser
      .addCase(blockUser.fulfilled, (state, { payload }) => {
        state.users = state.users.map((u) => u._id === payload.user._id ? payload.user : u);
      })
      .addCase(unblockUser.fulfilled, (state, { payload }) => {
        state.users = state.users.map((u) => u._id === payload.user._id ? payload.user : u);
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.users = state.users.filter((u) => u._id !== payload);
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
