import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';

const RegisterPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'member' });
  const [errors, setErrors] = useState({});

  useEffect(() => { if (token) navigate('/dashboard'); }, [token, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Minimum 3 caractères';
    if (!form.email)    e.email    = 'Email requis';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 caractères';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirm, ...payload } = form;
    const result = await dispatch(register(payload));
    if (register.fulfilled.match(result)) {
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ProjectManager</h1>
          <p className="text-gray-500 text-sm mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Inscription</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Nom"
              type="text"
              placeholder="John Doe"
              icon={FiUser}
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              icon={FiMail}
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
            />

            {/* Role selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Rôle</label>
              <select
                className="input"
                value={form.role || 'member'}
                onChange={set('role')}
              >
                <option value="member">Membre</option>
                <option value="guest">Invité</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 h-10"
            >
              {loading ? <Spinner size="sm" /> : <><FiUserPlus size={16} /> Créer le compte</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ProjectManager · M206 Cloud Native · 2025/2026
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
