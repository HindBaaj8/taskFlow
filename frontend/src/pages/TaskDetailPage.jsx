import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import CommentSection from "../components/CommentSection";

const STATUSES = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
];

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/tasks/${id}`).then((res) => {
      setTask(res.data);
      setForm(res.data);
    }).catch(console.error);
  }, [id]);

  const changeStatus = async (status) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      setTask(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/tasks/${id}`, form);
      setTask(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!task) return <div style={{ textAlign: "center", marginTop: 80, color: "#999" }}>Chargement...</div>;

  return (
    <div className="task-detail">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← Retour
      </button>

      <div className="task-detail-card">
        {!editing ? (
          <>
            <div className="task-detail-header">
              <h2>{task.title}</h2>
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority}
              </span>
            </div>

            <p className="task-description">
              {task.description || "Aucune description"}
            </p>

            {task.deadline && (
              <p className="task-deadline-detail">
                📅 Deadline : {new Date(task.deadline).toLocaleDateString()}
              </p>
            )}

            <div className="status-buttons">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  className={`status-btn ${task.status === s.value ? "active" : ""}`}
                  onClick={() => changeStatus(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button className="btn-edit" onClick={() => setEditing(true)}>
              ✏️ Modifier
            </button>
          </>
        ) : (
          <form className="edit-form" onSubmit={handleUpdate}>
            <h3 style={{ marginBottom: 16 }}>Modifier la tâche</h3>
            <input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">🟢 Faible</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
            <input
              type="date"
              value={form.deadline?.slice(0, 10) || ""}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <div className="edit-form-buttons">
              <button type="submit" className="btn-save">💾 Enregistrer</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Annuler</button>
            </div>
          </form>
        )}
      </div>

      <CommentSection taskId={id} />
    </div>
  ); 
}