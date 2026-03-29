import { configureStore } from '@reduxjs/toolkit';
import authReducer    from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
import taskReducer    from '../features/tasks/taskSlice';
import collabReducer  from '../features/collab/collabSlice';
import reportReducer  from '../features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    projects: projectReducer,
    tasks:   taskReducer,
    collab:  collabReducer,
    reports: reportReducer,
  },
});

export default store;
