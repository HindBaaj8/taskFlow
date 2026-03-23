import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import CommentSection from "../components/CommentSection";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/tasks/${id}`).then(res => {
      setTask(res.data);
      setForm(res.data);
    });
  }, [id]);

  const changeStatus = async (status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    setTask(res.data);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await api.put(`/tasks/${id}`, form);
    setTask(res.data);
    setEditing(false);
  };

  if (!task) return (
    <div style={{ textAlign: "center", marginTop: 80, color: "#999" }}>
      Chargement...
    </div>
  );

  const priorityColors = {
    low: { bg: "#e8f5e9", color: "#2e7d32" },
    medium: { bg: "#fff8e1", color: "#f57f17" },
    high: { bg: "#ffebee", color: "#c62828" },
  };
  const p = priorityColors[task.priority] || priorityColors.medium;

  const inputStyle = {
    width: "100%", padding: "8px 12px",
    borderRadius: 8, border: "1px solid #ddd",
    fontSize: 14, marginBottom: 10,
    boxSizing: "border-box"
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>

      {/* Bouton retour */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "none", border: "none",
          cursor: "pointer", color: "#666",
          fontSize: 14, marginBottom: 16, padding: 0
        }}
      >
        ← Retour
      </button>

      {/* Carte tâche */}
      <div style={{
        background: "white", borderRadius: 12,
        padding: 24, boxShadow: "0 2px 12px #00000015",
        marginBottom: 24
      }}>
        {!editing ? (
          <>
            {/* Titre + priorité */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ margin: "0 0 8px" }}>{task.title}</h2>
              <span style={{
                ...p, padding: "4px 12px",
                borderRadius: 12, fontSize: 13, fontWeight: 500
              }}>
                {task.priority}
              </span>
            </div>

            {/* Description */}
            <p style={{ color: "#555", marginBottom: 16 }}>
              {task.description || "Aucune description"}
            </p>

            {/* Deadline */}
            {task.deadline && (
              <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
                📅 Deadline : {new Date(task.deadline).toLocaleDateString()}
              </p>
            )}

            {/* Assigné à */}
            {task.assignedTo && (
              <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
                👤 Assigné à : {task.assignedTo.name || task.assignedTo}
              </p>
            )}

            {/* Changer le statut */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Statut :
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {["todo", "in_progress", "done"].map(s => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      border: "none", cursor: "pointer", fontSize: 13,
                      background: task.status === s ? "#1a1a2e" : "#f0f0f0",
                      color: task.status === s ? "white" : "#333",
                      fontWeight: task.status === s ? 600 : 400
                    }}
                  >
                    {s === "todo" ? "À faire"
                      : s === "in_progress" ? "En cours"
                      : "Terminé"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton modifier */}
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "#1a1a2e", color: "white",
                border: "none", padding: "8px 20px",
                borderRadius: 8, cursor: "pointer", fontSize: 14
              }}
            >
              ✏️ Modifier
            </button>
          </>
        ) : (
          /* Formulaire modification */
          <form onSubmit={handleUpdate}>
            <h3 style={{ margin: "0 0 16px" }}>Modifier la tâche</h3>
            <input
              placeholder="Titre"
              style={inputStyle}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              style={{ ...inputStyle, height: 80 }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <select
              style={inputStyle}
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">🟢 Faible</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
            <input
              type="date"
              style={inputStyle}
              value={form.deadline?.slice(0, 10) || ""}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{
                  background: "#1a1a2e", color: "white",
                  border: "none", padding: "8px 20px",
                  borderRadius: 8, cursor: "pointer", flex: 1
                }}
              >
                💾 Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  background: "#f0f0f0", color: "#333",
                  border: "none", padding: "8px 20px",
                  borderRadius: 8, cursor: "pointer", flex: 1
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Commentaires */}
      <CommentSection taskId={id} />
    </div>
  );
}