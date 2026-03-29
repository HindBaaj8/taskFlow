import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collabAPI } from '../../services/api';

const initialState = {
  // Chat
  currentProjectId: null,
  messages: [],
  hasMoreMessages: true,
  page: 1,
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // Real-time
  onlineUsers: [],
  typingUsers: [],
  socketStatus: 'disconnected', // disconnected | connecting | connected
  
  // UI
  loading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────
export const getMessages = createAsyncThunk(
  'collab/getMessages',
  async ({ projectId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await collabAPI.get(`/messages/${projectId}?page=${page}`);
      return { projectId, messages: data.messages, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'collab/sendMessage',
  async ({ projectId, content }, thunkAPI) => {
    try {
      const socket = thunkAPI.getState().collab.socketStatus === 'connected' ? 
        // Socket emit handled in component, API fallback if needed
        console.log('Socket send') : null;
      return { projectId, content };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getNotifications = createAsyncThunk(
  'collab/getNotifications', 
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await collabAPI.get('/notifications');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'collab/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await collabAPI.patch(`/notifications/${notificationId}/read`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────
const collabSlice = createSlice({
  name: 'collab',
  initialState,
  reducers: {
    setCurrentProject: (state, { payload }) => {
      state.currentProjectId = payload;
      state.messages = [];
      state.page = 1;
      state.hasMoreMessages = true;
    },
    addMessage: (state, { payload }) => {
      state.messages.unshift(payload);
    },
    setMessages: (state, { payload: { messages, hasMore } }) => {
      state.messages = [...state.messages, ...messages];
    },
    incrementPage: (state) => { state.page += 1; },
    
    addNotification: (state, { payload }) => {
      state.notifications.unshift(payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, { payload }) => {
      state.notifications = payload.notifications;
      state.unreadCount = payload.unreadCount;
    },
    decrementUnreadCount: (state) => { state.unreadCount -= 1; },
    
    setOnlineUsers: (state, { payload }) => { state.onlineUsers = payload; },
    addTypingUser: (state, { payload }) => { 
      if (!state.typingUsers.some(u => u.userId === payload.userId)) {
        state.typingUsers.push(payload); 
      }
    },
    removeTypingUser: (state, { payload }) => {
      state.typingUsers = state.typingUsers.filter(u => u.userId !== payload);
    },
    setSocketStatus: (state, { payload }) => { state.socketStatus = payload; },
    
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Messages
      .addCase(getMessages.pending, (state) => { state.loading = true; })
      .addCase(getMessages.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.messages = payload.page === 1 ? payload.messages : [...state.messages, ...payload.messages];
        state.hasMoreMessages = payload.messages.length === 50; // backend limit
        state.error = null;
      })
      .addCase(getMessages.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      
      // Notifications
      .addCase(getNotifications.fulfilled, (state, { payload }) => {
        state.notifications = payload.notifications;
        state.unreadCount = payload.unreadCount;
      });
  },
});

export const { 
  // Reducers
  setCurrentProject, addMessage, setMessages, incrementPage,
  addNotification, setNotifications, decrementUnreadCount,
  setOnlineUsers, addTypingUser, removeTypingUser,
  setSocketStatus, clearError,
} = collabSlice.actions;

export default collabSlice.reducer;

