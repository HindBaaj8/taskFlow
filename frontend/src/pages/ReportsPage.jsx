import { FiBarChart2 } from 'react-icons/fi';
const ReportsPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
    <div className="card flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <FiBarChart2 size={48} />
      <p className="text-lg font-medium">Statistiques & rapports</p>
      <p className="text-sm">Connectez au report-service (port 3005)</p>
    </div>
  </div>
);
export default ReportsPage;
