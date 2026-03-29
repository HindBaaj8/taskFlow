import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTaskStatus, deleteTask } from '../features/tasks/taskSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import AddTaskModal from '../components/modals/AddTaskModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiCheckSquare, FiTrash2, FiFlag, FiCalendar, FiUser } from 'react-icons/fi';

const PRIORITY_STYLE = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};
const PRIORITY_LABEL = { low: 'Faible', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' };

const COLUMNS = [
  { key: 'todo',        label: 'À faire',   color: 'bg-gray-100',    dot: 'bg-gray-400' },
  { key: 'in-progress', label: 'En cours',  color: 'bg-amber-50',    dot: 'bg-amber-500' },
  { key: 'done',        label: 'Terminé',   color: 'bg-green-50',    dot: 'bg-green-500' },
];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : null;
const isOverdue  = (d) => d && new Date(d) < new Date();

const TaskCard = ({ task, onDelete, onMove }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition group">
    {/* Priority */}
    <div className="flex items-start justify-between gap-2">
      <span className={`badge ${PRIORITY_STYLE[task.priority] || 'bg-gray-100 text-gray-600'}`}>
        <FiFlag size={10} className="mr-1" />
        {PRIORITY_LABEL[task.priority] || task.priority}
      </span>
      <button
        onClick={() => onDelete(task._id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition"
      >
        <FiTrash2 size={13} />
      </button>
    </div>

    {/* Title */}
    <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>

    {/* Description */}
    {task.description && (
      <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
    )}

    {/* Deadline */}
    {task.deadline && (
      <div className={`flex items-center gap-1.5 text-xs ${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
        <FiCalendar size={11} />
        <span>{formatDate(task.deadline)}</span>
        {isOverdue(task.deadline) && task.status !== 'done' && <span>(En retard)</span>}
      </div>
    )}

    {/* Assigned */}
    {task.assignedTo && (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <FiUser size={11} />
        <span className="truncate">{task.assignedTo}</span>
      </div>
    )}

    {/* Move buttons */}
    <div className="flex gap-1 pt-1 border-t border-gray-50">
      {task.status !== 'todo' && (
        <button
          onClick={() => onMove(task._id, task.status === 'done' ? 'in-progress' : 'todo')}
          className="flex-1 text-xs py-1 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition"
        >
          ← Reculer
        </button>
      )}
      {task.status !== 'done' && (
        <button
          onClick={() => onMove(task._id, task.status === 'todo' ? 'in-progress' : 'done')}
          className="flex-1 text-xs py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition"
        >
          Avancer →
        </button>
      )}
    </div>
  </div>
);

const TasksPage = () => {
  const dispatch = useDispatch();
  const { kanban, loading }    = useSelector((s) => s.tasks);
  const { list: projects }     = useSelector((s) => s.projects);

  const [showModal, setShowModal]       = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    dispatch(fetchProjects({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject) dispatch(fetchTasks({ projectId: selectedProject }));
  }, [selectedProject, dispatch]);

  const handleMove = async (id, status) => {
    const r = await dispatch(updateTaskStatus({ id, status }));
    if (updateTaskStatus.rejected.match(r)) toast.error(r.payload);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    const r = await dispatch(deleteTask(id));
    if (deleteTask.fulfilled.match(r)) toast.success('Tâche supprimée');
    else toast.error(r.payload);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches — Kanban</h1>
          <p className="text-sm text-gray-500 mt-1">Glissez les tâches entre colonnes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus size={16} /> Nouvelle tâche
        </button>
      </div>

      {/* Project selector */}
      <div className="card p-4 flex items-center gap-3">
        <FiCheckSquare size={16} className="text-gray-400" />
        <select
          className="input flex-1 max-w-xs"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Sélectionner un projet</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {selectedProject && (
          <p className="text-sm text-gray-400">
            {Object.values(kanban).flat().length} tâche(s)
          </p>
        )}
      </div>

      {/* Kanban board */}
      {!selectedProject ? (
        <div className="card flex flex-col items-center py-20 gap-3 text-gray-400">
          <FiCheckSquare size={48} />
          <p className="text-lg font-medium">Sélectionnez un projet</p>
          <p className="text-sm">pour afficher le tableau Kanban</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ key, label, color, dot }) => (
            <div key={key} className={`rounded-2xl ${color} p-4 flex flex-col gap-3 min-h-64`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full">
                  {kanban[key]?.length || 0}
                </span>
              </div>

              {/* Task cards */}
              {kanban[key]?.length === 0 ? (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                  Aucune tâche
                </div>
              ) : (
                kanban[key].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDelete={handleDelete}
                    onMove={handleMove}
                  />
                ))
              )}

              {/* Add quick button */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 py-2 px-3 rounded-lg hover:bg-white/60 transition w-full"
              >
                <FiPlus size={14} /> Ajouter une tâche
              </button>
            </div>
          ))}
        </div>
      )}

      <AddTaskModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); if (selectedProject) dispatch(fetchTasks({ projectId: selectedProject })); }}
        defaultProjectId={selectedProject}
      />
    </div>
  );
};

export default TasksPage;