import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, fetchCategories } from '../../features/projects/projectSlice';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';
import { FiFolder, FiAlignLeft, FiCalendar, FiTag } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'planning',  label: 'Planification' },
  { value: 'active',    label: 'Actif' },
  { value: 'on-hold',   label: 'En pause' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

const EMPTY = {
  name:        '',
  description: '',
  startDate:   '',
  endDate:     '',
  status:      'planning',
  category:    '',
};

const AddProjectModal = ({ isOpen, onClose }) => {
  const dispatch    = useDispatch();
  const { loading, categories } = useSelector((s) => s.projects);

  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories());
      setForm(EMPTY);
      setErrors({});
    }
  }, [isOpen, dispatch]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name      = 'Nom requis';
    if (!form.startDate)    e.startDate = 'Date de début requise';
    if (!form.endDate)      e.endDate   = 'Date de fin requise';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = 'La date de fin doit être après la date de début';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    if (!payload.category) delete payload.category;

    const result = await dispatch(createProject(payload));
    if (createProject.fulfilled.match(result)) {
      toast.success('Projet créé avec succès !');
      onClose();
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau projet" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        {/* Name */}
        <Input
          label="Nom du projet *"
          type="text"
          placeholder="Ex: Refonte site web"
          icon={FiFolder}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiAlignLeft size={14} /> Description
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Décrivez votre projet..."
            value={form.description}
            onChange={set('description')}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date de début *"
            type="date"
            icon={FiCalendar}
            value={form.startDate}
            onChange={set('startDate')}
            error={errors.startDate}
          />
          <Input
            label="Date de fin *"
            type="date"
            icon={FiCalendar}
            value={form.endDate}
            onChange={set('endDate')}
            error={errors.endDate}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiTag size={14} /> Catégorie
          </label>
          <select className="input" value={form.category} onChange={set('category')}>
            <option value="">Sans catégorie</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : 'Créer le projet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;