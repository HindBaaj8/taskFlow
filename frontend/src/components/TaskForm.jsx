import { useState } from "react";
import api from "../api/api";

export default function TaskForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", form);
      setForm({ title: "", description: "", priority: "medium", deadline: "" });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="task-form">
      <h3>Nouvelle tâche</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Titre *"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={form.description}
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
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <button type="submit" className="btn-primary">
          Créer la tâche
        </button>
      </form>
    </div>
  );
}