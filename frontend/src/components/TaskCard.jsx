export default function TaskCard({ task, onClick, onDelete }) {
  const priorityColors = {
    low: { bg: "#e8f5e9", color: "#2e7d32" },
    medium: { bg: "#fff8e1", color: "#f57f17" },
    high: { bg: "#ffebee", color: "#c62828" },
  };

  const p = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        cursor: "pointer",
        boxShadow: "0 2px 6px #00000015",
        transition: "transform 0.1s",
      }}
    >
      {/* Titre */}
      <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 15 }}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>
          {task.description}
        </p>
      )}

      {/* Priorité + Deadline */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          ...p, padding: "2px 10px",
          borderRadius: 12, fontSize: 12, fontWeight: 500
        }}>
          {task.priority}
        </span>

        {task.deadline && (
          <span style={{ fontSize: 12, color: "#999" }}>
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Assigné à */}
      {task.assignedTo && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#888" }}>
          👤 {task.assignedTo.name || task.assignedTo}
        </p>
      )}

      {/* Bouton Supprimer */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          marginTop: 10, background: "none", border: "none",
          color: "#e53935", cursor: "pointer", fontSize: 12, padding: 0
        }}
      >
        🗑 Supprimer
      </button>
    </div>
  );
}