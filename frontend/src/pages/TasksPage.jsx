import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchKanban, moveTask, deleteTask } from '../features/tasks/taskSlice';
import AddTaskModal from '../components/modals/AddTaskModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import SocketService from '../services/socket';
import { FiPlus, FiCheckSquare, FiTrash2, FiFlag, FiCalendar, FiUser, FiMove } from 'react-icons/fi';

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
const isOverdue = (d) => d && new Date(d) < new Date();

const TaskCard = ({ task, onDelete, provided, snapshot }) => (
  <div
    ref={provided.innerRef}
    {...provided.draggableProps}
    className={`bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing focus:outline-none ${
      snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-500/50 scale-105' : ''
    }`}
  >
    {/* Drag handle */}
    <div className="flex items-center justify-between mb-2">
      <div {...provided.dragHandleProps} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 cursor-grab">
        <FiMove size={14} />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
        className="p-1 rounded text-gray-300 hover:text-red-500 transition opacity-75 hover:opacity-100"
      >
        <FiTrash2 size={14} />
      </button>
    </div>

    {/* Priority */}
    <div className="flex items-start justify-between gap-2">
      <span className={`badge text-xs px-2 py-0.5 ${PRIORITY_STYLE[task.priority] || 'bg-gray-100 text-gray-600'}`}>
        {PRIORITY_LABEL[task.priority] || task.priority}
      </span>
    </div>

    {/* Title */}
    <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{task.title}</p>

    {/* Description */}
    {task.description && (
      <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
    )}

    {/* Meta */}
    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
      {task.deadline && (
        <div className={`flex items-center gap-1 ${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-medium' : ''}`}>
          <FiCalendar size={11} />
          {formatDate(task.deadline)}
          {isOverdue(task.deadline) && task.status !== 'done' && '(En retard)'} 
        </div>
      )}
      {task.assignedTo?.name && (
        <div className="flex items-center gap-1">
          <FiUser size={11} />
          {task.assignedTo.name}
        </div>
      )}
    </div>
  </div>
);

const TasksPage = () => {
  const dispatch = useDispatch();
  const { kanban, loading } = useSelector((s) => s.tasks);
  const { list: projects } = useSelector((s) => s.projects);

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  // Socket room management
  useEffect(() => {
    if (selectedProject) {
      SocketService.joinRoom(selectedProject);
    }
    return () => {
      if (selectedProject) SocketService.leaveRoom(selectedProject);
    };
  }, [selectedProject]);

  useEffect(() => {
    dispatch(fetchProjects({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchKanban(selectedProject));
    }
  }, [selectedProject, dispatch]);

  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;
    
    // Dropped out of list or same position
    if (!destination || source.droppableId === destination.droppableId) return;
    
    dispatch(moveTask({
      id: result.draggableId,
      newStatus: destination.droppableId,
      projectId: selectedProject
    }));
  }, [dispatch, selectedProject]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    const r = await dispatch(deleteTask(id));
    if (deleteTask.fulfilled.match(r)) {
      toast.success('Tâche supprimée');
    } else {
      toast.error(r.payload || 'Erreur suppression');
    }
  };

  if (!selectedProject) {
    return (
      <div className="card flex flex-col items-center py-20 gap-3 text-gray-400">
        <FiCheckSquare size={48} />
        <p className="text-lg font-medium">Sélectionnez un projet</p>
        <p className="text-sm">pour afficher le tableau Kanban</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches Kanban</h1>
          <p className="text-sm text-gray-500 mt-1">Glissez-déposez les tâches entre colonnes • Real-time collab</p>
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
          <option value="">— Sélectionnez un projet —</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <p className="text-sm text-gray-400">
            {Object.values(kanban).flat().length || 0} tâche(s)
          </p>
        )}
      </div>

      {/* DnD Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(({ key, label, color, dot }) => (
            <div key={key} className={`rounded-2xl ${color} p-6 flex flex-col gap-4 min-h-[400px]`}>
              {/* Column header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${dot}`} />
                  <h2 className="font-semibold text-gray-800">{label}</h2>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                  {kanban[key]?.length || 0}
                </span>
              </div>

              {/* Droppable tasks list */}
              <Droppable droppableId={key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-opacity-75' : ''}`}
                    {...provided.droppableProps}
                  >
                    {kanban[key]?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <FiCheckSquare size={24} />
                        <p className="text-sm mt-1">Aucune tâche</p>
                      </div>
                    ) : (
                      kanban[key].map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <TaskCard
                              task={task}
                              onDelete={handleDelete}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Quick add */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-white/50 transition w-full"
              >
                <FiPlus size={16} />
                Ajouter une tâche
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddTaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (selectedProject) dispatch(fetchKanban(selectedProject));
        }}
        defaultProjectId={selectedProject}
      />
    </div>
  );
};

export default TasksPage;

