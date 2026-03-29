import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, deleteProject } from '../features/projects/projectSlice';
import AddProjectModal from '../components/modals/AddProjectModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiFolder, FiCalendar, FiTrash2, FiEdit2, FiSearch, FiRefreshCw, FiTag } from 'react-icons/fi';

const STATUS_STYLE = {
  planning:  'bg-gray-100 text-gray-600',
  active:    'bg-green-100 text-green-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  completed: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-red-100 text-red-600',
};
const STATUS_LABEL = {
  planning: 'Planification', active: 'Actif', 'on-hold': 'En pause',
  completed: 'Terminé', cancelled: 'Annulé',
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { list: projects, loading, pagination } = useSelector((s) => s.projects);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);

  const load = () => dispatch(fetchProjects({ name: search, status, page, limit: 9 }));
  useEffect(() => { load(); }, [page, status]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    const r = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(r)) toast.success('Projet supprimé');
    else toast.error(r.payload);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination?.total ?? 0} projet(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary"><FiRefreshCw size={15} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <FiPlus size={16} /> Nouveau projet
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Rechercher</button>
        </form>
        <select className="input w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <div className="card flex flex-col items-center py-20 gap-4 text-gray-400">
          <FiFolder size={48} />
          <p className="text-lg font-medium">Aucun projet trouvé</p>
          <button onClick={() => setShowModal(true)} className="btn-primary"><FiPlus size={16} /> Créer un projet</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="card p-5 flex flex-col gap-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FiFolder size={18} />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                </div>
                <span className={`badge flex-shrink-0 ${STATUS_STYLE[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[p.status] || p.status}
                </span>
              </div>
              {p.description && <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>}
              {p.category && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FiTag size={12} /><span>{p.category.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3">
                <FiCalendar size={12} />
                <span>{formatDate(p.startDate)}</span><span>→</span><span>{formatDate(p.endDate)}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1 text-xs py-1.5"><FiEdit2 size={13} /> Modifier</button>
                <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">Précédent</button>
          <span className="text-sm text-gray-500">Page {page} / {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary disabled:opacity-40">Suivant</button>
        </div>
      )}

      <AddProjectModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ProjectsPage;