import { BrowserRouter, Routes, Route } from "react-router-dom";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";

export default function App() {
  return (
   
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
           <TasksPage />
           } />
          <Route path="/tasks/:id" element={<TaskDetailPage />
          } />
        </Routes>
      </BrowserRouter>
  
  );
}