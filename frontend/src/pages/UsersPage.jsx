import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, blockUser, unblockUser, deleteUser } from '../features/auth/authSlice';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiSearch, FiLock, FiUnlock, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const ROLES = ['', 'admin', 'member', 'guest'];

const roleBadge = (role) => {
  const map = {
    admin:  'bg-red-100 text-red-700',
    member: 'bg-primary-100 text-primary-700',
    guest:  'bg-gray-100 text-gray-600',
  };
  return <span className={`badge ${map[role] || 'bg-gray-100 text-gray-600'}`}>{role}</span>;
};

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector((s) => s.auth);

  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [page, setPage]       = useState(1);

  const fetchUsers = () => dispatch(getUsers({ search, role, page, limit: 10 }));

  useEffect(() => { fetchUsers(); }, [page, role]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlock = async (id) => {
    const r = await dispatch(blockUser(id));
    if (blockUser.fulfilled.match(r)) toast.success('Utilisateur bloqué');
    else toast.error(r.payload);
  };

  const handleUnblock = async (id) => {
    const r = await dispatch(unblockUser(id));
    if (unblockUser.fulfilled.match(r)) toast.success('Utilisateur débloqué');
    else toast.error(r.payload);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    const r = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(r)) toast.success('Utilisateur supprimé');
    else toast.error(r.payload);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total ?? 0} utilisateurs enregistrés
          </p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary">
          <FiRefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Rechercher</button>
        </form>

        <select
          className="input w-40"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r || 'Tous les rôles'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
            <FiSearch size={32} />
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Utilisateur</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Rôle</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    {/* Avatar + username */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">{roleBadge(u.role)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {u.isBlocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(u._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                            title="Débloquer"
                          >
                            <FiUnlock size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(u._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Bloquer"
                          >
                            <FiLock size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Supprimer"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
