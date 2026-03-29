import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../features/auth/authSlice';
import Spinner from '../components/common/Spinner';
import { FiFolder, FiCheckSquare, FiUsers, FiAlertCircle } from 'react-icons/fi';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!user) dispatch(getMe());
  }, [dispatch, user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projets actifs"   value="—" icon={FiFolder}      color="bg-primary-50 text-primary-600" />
        <StatCard label="Tâches en cours"  value="—" icon={FiCheckSquare} color="bg-amber-50 text-amber-600" />
        <StatCard label="Membres"          value="—" icon={FiUsers}       color="bg-green-50 text-green-600" />
        <StatCard label="Tâches en retard" value="—" icon={FiAlertCircle} color="bg-red-50 text-red-500" />
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Projets récents</h2>
          <p className="text-sm text-gray-400">Naviguez vers <strong>Projets</strong> pour gérer vos projets.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Tâches assignées</h2>
          <p className="text-sm text-gray-400">Naviguez vers <strong>Tâches</strong> pour voir votre Kanban.</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="card p-4 flex items-center gap-3">
        <span className={`badge ${
          user?.role === 'admin'  ? 'bg-red-100 text-red-700' :
          user?.role === 'member' ? 'bg-primary-100 text-primary-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {user?.role}
        </span>
        <p className="text-sm text-gray-500">
          {user?.role === 'admin'  && 'Vous avez accès à toutes les fonctionnalités d\'administration.'}
          {user?.role === 'member' && 'Vous pouvez créer et gérer des projets et des tâches.'}
          {user?.role === 'guest'  && 'Vous avez un accès en lecture seule.'}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
