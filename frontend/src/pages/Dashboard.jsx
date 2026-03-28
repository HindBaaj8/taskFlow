import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../api/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "in_progress", label: "En cours" },
  { id: "done", label: "Terminé" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="dashboard">
      <h2>📋 Tableau des tâches</h2>

      <TaskForm onSuccess={fetchTasks} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                {col.label} ({getTasksByStatus(col.id).length})
              </div>

              <Droppable droppableId={col.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column-body ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                  >
                    {getTasksByStatus(col.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                            task={task}
                            onDetail={() => navigate(`/tasks/${task._id}`)}
                            onDelete={() => handleDelete(task._id)}
/>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}