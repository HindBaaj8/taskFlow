import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../features/tasks/taskSlice';
import { fetchProjects } from '../../features/projects/projectSlice';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';
import { FiCheckSquare, FiAlignLeft, FiCalendar, FiUser, FiFolder, FiFlag } from 'react-icons/fi';

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Faible',  color: 'text-green-600' },
  { value: 'medium', label: 'Moyenne', color: 'text-amber-600' },
  { value: 'high',   label: 'Haute',   color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
];

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'À faire' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'done',        label: 'Terminé' },
];

const EMPTY = {
  title:       '',
  description: '',
  priority:    'medium',
  status:      'todo',
  deadline:    '',
  projectId:   '',
  assignedTo:  '',
};

const AddTaskModal = ({ isOpen, onClose, defaultProjectId = '' }) => {
  const dispatch = useDispatch();
  const { loading }    = useSelector((s) => s.tasks);
  const { list: projects } = useSelector((s) => s.projects);

  const [form, setForm]     = useState({ ...EMPTY, projectId: defaultProjectId });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, projectId: defaultProjectId });
      setErrors({});
      if (projects.length === 0) dispatch(fetchProjects());
    }
  }, [isOpen, defaultProjectId, dispatch, projects.length]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title     = 'Titre requis';
    if (!form.projectId)    e.projectId = 'Projet requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    if (!payload.deadline)   delete payload.deadline;
    if (!payload.assignedTo) delete payload.assignedTo;

    const result = await dispatch(createTask(payload));
    if (createTask.fulfilled.match(result)) {
      toast.success('Tâche créée avec succès !');
      onClose();
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle tâche" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        {/* Title */}
        <Input
          label="Titre de la tâche *"
          type="text"
          placeholder="Ex: Créer la maquette UI"
          icon={FiCheckSquare}
          value={form.title}
          onChange={set('title')}
          error={errors.title}
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiAlignLeft size={14} /> Description
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Décrivez cette tâche..."
            value={form.description}
            onChange={set('description')}
          />
        </div>

        {/* Project */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiFolder size={14} /> Projet *
          </label>
          <select
            className={`input ${errors.projectId ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.projectId}
            onChange={set('projectId')}
          >
            <option value="">Sélectionner un projet</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <p className="text-xs text-red-500">{errors.projectId}</p>}
        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <FiFlag size={14} /> Priorité
            </label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Statut initial</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority badge preview */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <FiFlag size={14} className={PRIORITY_OPTIONS.find(p => p.value === form.priority)?.color} />
          <span className="text-sm text-gray-600">
            Priorité sélectionnée :{' '}
            <span className={`font-medium ${PRIORITY_OPTIONS.find(p => p.value === form.priority)?.color}`}>
              {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
            </span>
          </span>
        </div>

        {/* Deadline */}
        <Input
          label="Deadline"
          type="date"
          icon={FiCalendar}
          value={form.deadline}
          onChange={set('deadline')}
        />

        {/* Assigned to */}
        <Input
          label="Assigner à (userId)"
          type="text"
          placeholder="ID de l'utilisateur"
          icon={FiUser}
          value={form.assignedTo}
          onChange={set('assignedTo')}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;