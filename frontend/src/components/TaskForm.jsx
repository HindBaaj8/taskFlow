import { useState } from "react";
import api from "../api/api";

export default function TaskForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    assignedTo: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", form);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px",
    borderRadius: 8, border: "1px solid #ddd",
    fontSize: 14, marginBottom: 10,
    boxSizing: "border-box"
  };

  return (
    <div style={{
      background: "#f9f9f9", padding: 20,
      borderRadius: 12, marginBottom: 24,
      boxShadow: "0 2px 8px #00000010"
    }}>
      <h3 style={{ margin: "0 0 16px" }}>Nouvelle tâche</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Titre *"
          required
          style={inputStyle}
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          style={{ ...inputStyle, height: 80, resize: "vertical" }}
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
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
        />
        <input
          placeholder="ID utilisateur assigné"
          style={inputStyle}
          value={form.assignedTo}
          onChange={e => setForm({ ...form, assignedTo: e.target.value })}
        />
        <button
          type="submit"
          style={{
            background: "#1a1a2e", color: "white",
            border: "none", padding: "10px 24px",
            borderRadius: 8, cursor: "pointer",
            fontSize: 14, width: "100%"
          }}
        >
          Créer la tâche
        </button>
      </form>
    </div>
  );
}