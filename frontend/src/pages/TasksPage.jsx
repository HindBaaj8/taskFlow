import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

const COLUMNS = {
  todo: { label: "À faire", color: "#e3f2fd" },
  in_progress: { label: "En cours", color: "#fff8e1" },
  done: { label: "Terminé", color: "#e8f5e9" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => { fetchTasks(); }, []);

  
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

   
    if (!destination) return;

   
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;

    setTasks(prev =>
      prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t)
    );

   
    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      
      fetchTasks();
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const getTasksByStatus = (status) =>
    tasks.filter(t => t.status === status);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24
      }}>
        <h2 style={{ margin: 0 }}>📋 Tableau des tâches</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#1a1a2e", color: "white",
            border: "none", padding: "8px 16px",
            borderRadius: 8, cursor: "pointer", fontSize: 14
          }}>
          {showForm ? "✕ Fermer" : "+ Nouvelle tâche"}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <TaskForm onSuccess={() => { setShowForm(false); fetchTasks(); }} />
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16
        }}>
          {Object.entries(COLUMNS).map(([status, { label, color }]) => (
            <div key={status} style={{
              background: color,
              borderRadius: 12,
              padding: 16,
              minHeight: 500
            }}>
              {/* Header  */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 12
              }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{label}</h3>
                <span style={{
                  background: "#00000015", borderRadius: 12,
                  padding: "2px 10px", fontSize: 13
                }}>
                  {getTasksByStatus(status).length}
                </span>
              </div>

              {/* Droppable Zone */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 100,
                      background: snapshot.isDraggingOver
                        ? "#00000010" : "transparent",
                      borderRadius: 8,
                      transition: "background 0.2s",
                      padding: 4
                    }}
                  >
                    {getTasksByStatus(status).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard
                              task={task}
                              onClick={() => navigate(`/tasks/${task._id}`)}
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