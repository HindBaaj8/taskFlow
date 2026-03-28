export default function TaskCard({ task, onDetail, onDelete }) {
  return (
    <div className="task-card">
      <h4>{task.title}</h4>

      {task.description && <p>{task.description}</p>}

      <div className="task-card-footer">
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
        {task.deadline && (
          <span className="task-deadline">
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="task-card-buttons">
        <button className="btn-detail" onClick={onDetail}>
          🔍 Voir détail
        </button>
        <button className="btn-delete" onClick={onDelete}>
          🗑 Supprimer
        </button>
      </div>
    </div>
  );
}