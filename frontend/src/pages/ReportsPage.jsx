import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard, fetchProjectReport, fetchWorkload } from '../features/reports/reportSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import Spinner from '../components/common/Spinner';
import {
  FiBarChart2, FiRefreshCw, FiFolder, FiCheckSquare,
  FiAlertCircle, FiUsers, FiTrendingUp, FiFlag,
} from 'react-icons/fi';

// ─── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Bar Chart (pure SVG) ─────────────────────────────────────────
const BarChart = ({ data, title, color = '#6366f1' }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const W = 260, H = 110, PAD = 28;
  const slotW = (W - PAD * 2) / entries.length;
  const BAR_W = Math.min(32, slotW - 10);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full">
        <line x1={PAD - 4} y1={0} x2={PAD - 4} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        <line x1={PAD - 4} y1={H} x2={W - PAD + 4} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        {entries.map(([key, val], i) => {
          const barH = Math.max(4, (val / max) * H);
          const x    = PAD + i * slotW + (slotW - BAR_W) / 2;
          const y    = H - barH;
          return (
            <g key={key}>
              <rect x={x} y={y} width={BAR_W} height={barH} rx="4" fill={color} opacity="0.82" />
              {val > 0 && (
                <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#374151">{val}</text>
              )}
              <text x={x + BAR_W / 2} y={H + 15} textAnchor="middle" fontSize="9" fill="#9ca3af">
                {key.length > 8 ? key.slice(0, 7) + '…' : key}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Donut Chart (pure SVG) ───────────────────────────────────────
const PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const DonutChart = ({ data, title, colors }) => {
  if (!data) return null;
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  const total       = entries.reduce((s, [, v]) => s + v, 0);
  const R = 38, CX = 55, CY = 52, SW = 13;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 110 104" style={{ width: 110, flexShrink: 0 }}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={SW} />
          {entries.map(([key, val], i) => {
            const pct  = val / total;
            const dash = pct * circ;
            const el   = (
              <circle
                key={key} cx={CX} cy={CY} r={R} fill="none"
                stroke={(colors || PALETTE)[i % PALETTE.length]}
                strokeWidth={SW}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px` }}
              />
            );
            offset += dash;
            return el;
          })}
          <text x={CX} y={CY - 3}  textAnchor="middle" fontSize="15" fontWeight="600" fill="#111827">{total}</text>
          <text x={CX} y={CY + 11} textAnchor="middle" fontSize="8"  fill="#9ca3af">total</text>
        </svg>
        <div className="flex flex-col gap-2 flex-1">
          {entries.map(([key, val], i) => (
            <div key={key} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: (colors || PALETTE)[i % PALETTE.length] }} />
                <span className="text-gray-600 capitalize">{key}</span>
              </div>
              <span className="text-gray-500 font-medium">
                {val} <span className="text-gray-400">({Math.round((val / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────
const ProgressBar = ({ value, color = 'bg-primary-500', label }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-medium text-gray-700">{value}%</span>
      </div>
    )}
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  </div>
);

const completionColor = (pct) =>
  pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-primary-500';

// ─── Main page ────────────────────────────────────────────────────
const ReportsPage = () => {
  const dispatch = useDispatch();
  const { dashboard, projectReport, workload, loading } = useSelector((s) => s.reports);
  const { list: projects } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);

  const [tab, setTab]             = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchProjects({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'workload' && user?.role === 'admin') dispatch(fetchWorkload());
  }, [tab, dispatch, user]);

  useEffect(() => {
    if (tab === 'project' && selectedProject) dispatch(fetchProjectReport(selectedProject));
  }, [selectedProject, tab, dispatch]);

  const TABS = [
    { key: 'dashboard', label: 'Vue globale',        icon: FiBarChart2 },
    { key: 'project',   label: 'Par projet',         icon: FiFolder },
    ...(user?.role === 'admin'
      ? [{ key: 'workload', label: 'Charge de travail', icon: FiUsers }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">Visualisez l'avancement de vos projets</p>
        </div>
        <button
          onClick={() => {
            dispatch(fetchDashboard());
            if (selectedProject) dispatch(fetchProjectReport(selectedProject));
          }}
          className="btn-secondary"
        >
          <FiRefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ══ DASHBOARD ═══════════════════════════════════════════ */}
      {tab === 'dashboard' && (
        !dashboard && loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : dashboard ? (
          <div className="flex flex-col gap-5">

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total projets"       value={dashboard.summary.totalProjects}         icon={FiFolder}      color="bg-primary-50 text-primary-600" />
              <StatCard label="Total tâches"        value={dashboard.summary.totalTasks}            icon={FiCheckSquare} color="bg-amber-50 text-amber-600" />
              <StatCard label="En retard"           value={dashboard.summary.overdueTasks}          icon={FiAlertCircle} color="bg-red-50 text-red-500" />
              <StatCard label="Complétion globale"  value={`${dashboard.summary.completionRate}%`}  icon={FiTrendingUp}  color="bg-green-50 text-green-600" sub="tâches terminées" />
            </div>

            {/* Progress */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Progression globale</h2>
              <ProgressBar
                value={dashboard.summary.completionRate}
                label={`${dashboard.summary.completionRate}% des tâches terminées`}
                color={completionColor(dashboard.summary.completionRate)}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5">
                <DonutChart
                  title="Projets par statut"
                  data={dashboard.projectsByStatus}
                  colors={['#6366f1', '#10b981', '#f59e0b', '#6b7280', '#ef4444']}
                />
              </div>
              <div className="card p-5">
                <DonutChart
                  title="Tâches par statut"
                  data={dashboard.tasksByStatus}
                  colors={['#6b7280', '#f59e0b', '#10b981']}
                />
              </div>
              <div className="card p-5">
                <BarChart
                  title="Tâches par priorité"
                  data={dashboard.tasksByPriority}
                  color="#6366f1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center py-20 gap-3 text-gray-400">
            <FiBarChart2 size={48} />
            <p>Aucune donnée disponible</p>
          </div>
        )
      )}

      {/* ══ PROJECT REPORT ══════════════════════════════════════ */}
      {tab === 'project' && (
        <div className="flex flex-col gap-5">
          {/* Selector */}
          <div className="card p-4 flex items-center gap-3">
            <FiFolder size={16} className="text-gray-400 flex-shrink-0" />
            <select
              className="input flex-1 max-w-sm"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {!selectedProject ? (
            <div className="card flex flex-col items-center py-20 gap-3 text-gray-400">
              <FiFolder size={48} />
              <p>Sélectionnez un projet pour afficher ses statistiques</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : projectReport ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Total tâches"       value={projectReport.stats.totalTasks}            icon={FiCheckSquare} color="bg-primary-50 text-primary-600" />
                <StatCard label="Taux de complétion" value={`${projectReport.stats.completionRate}%`}  icon={FiTrendingUp}  color="bg-green-50 text-green-600" />
                <StatCard label="En retard"          value={projectReport.stats.overdueTasks}          icon={FiAlertCircle} color="bg-red-50 text-red-500" />
              </div>

              {/* Progress */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Avancement</h2>
                <ProgressBar
                  value={projectReport.stats.completionRate}
                  label={`${projectReport.stats.completionRate}% complété`}
                  color={completionColor(projectReport.stats.completionRate)}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5">
                  <DonutChart
                    title="Tâches par statut"
                    data={projectReport.tasksByStatus}
                    colors={['#6b7280', '#f59e0b', '#10b981']}
                  />
                </div>
                <div className="card p-5">
                  <BarChart title="Tâches par priorité" data={projectReport.tasksByPriority} color="#6366f1" />
                </div>
              </div>

              {/* Workload per member */}
              {projectReport.workloadByUser && Object.keys(projectReport.workloadByUser).length > 0 && (
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
                    <FiUsers size={15} /> Charge par membre
                  </h2>
                  <div className="flex flex-col gap-4">
                    {Object.entries(projectReport.workloadByUser).map(([uid, d]) => (
                      <div key={uid} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center">
                              {uid === 'unassigned' ? '?' : uid.slice(-2).toUpperCase()}
                            </div>
                            <span className="text-gray-700 font-medium">
                              {uid === 'unassigned' ? 'Non assigné' : `Utilisateur …${uid.slice(-6)}`}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{d.done}/{d.total} terminées</span>
                        </div>
                        <ProgressBar
                          value={d.total > 0 ? Math.round((d.done / d.total) * 100) : 0}
                          color={completionColor(d.total > 0 ? Math.round((d.done / d.total) * 100) : 0)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue tasks */}
              {projectReport.overdueTasks?.length > 0 && (
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
                    <FiAlertCircle size={15} /> Tâches en retard ({projectReport.overdueTasks.length})
                  </h2>
                  <div className="flex flex-col divide-y divide-gray-50">
                    {projectReport.overdueTasks.map((t) => (
                      <div key={t._id} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${
                            t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            t.priority === 'high'   ? 'bg-orange-100 text-orange-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            <FiFlag size={9} className="mr-1" />{t.priority}
                          </span>
                          <span className="text-sm text-gray-700">{t.title}</span>
                        </div>
                        <span className="text-xs text-red-500 font-medium">
                          {new Date(t.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ══ WORKLOAD (admin) ════════════════════════════════════ */}
      {tab === 'workload' && (
        !workload && loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : workload ? (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <FiUsers size={15} /> Charge de travail par utilisateur
            </h2>
            <div className="flex flex-col gap-6">
              {Object.entries(workload).map(([uid, d]) => (
                <div key={uid} className="flex flex-col gap-2 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center">
                        {uid === 'unassigned' ? '?' : uid.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {uid === 'unassigned' ? 'Non assigné' : `Utilisateur …${uid.slice(-6)}`}
                        </p>
                        <p className="text-xs text-gray-400">{d.total} tâche(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="badge bg-gray-100 text-gray-600">{d.todo} à faire</span>
                      <span className="badge bg-amber-100 text-amber-700">{d.inProgress} en cours</span>
                      <span className="badge bg-green-100 text-green-700">{d.done} terminées</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={d.total > 0 ? Math.round((d.done / d.total) * 100) : 0}
                    label={`${d.total > 0 ? Math.round((d.done / d.total) * 100) : 0}% complété`}
                    color={completionColor(d.total > 0 ? Math.round((d.done / d.total) * 100) : 0)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center py-20 gap-3 text-gray-400">
            <FiUsers size={48} />
            <p>Aucune donnée disponible</p>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsPage;