import { useApp } from '../../context/AppContext';
import { Mail, LogOut, Shield, Calendar } from 'lucide-react';
import { useId } from 'react';

export function Accueil() {
  const { client, setAuthenticated } = useApp();

  const emailId = useId();

  if (!client) return null;

  const handleLogout = () => {
    setAuthenticated(false);
  };

  const getInitials = () => {
    const parts = client.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return client.name.substring(0, 2).toUpperCase();
  };

  const roleLabel = client.role === 'admin' ? 'Administrateur' : client.role === 'manager' ? 'Manager' : 'Client';

  const memberSince = new Date(client.created_at).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon compte</h1>

      <section
        aria-labelledby="profile-heading"
        className="bg-white rounded-xl p-6 mb-4 shadow-sm text-center"
      >
        <h2 id="profile-heading" className="sr-only">Profil utilisateur</h2>
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.name}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div
            className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-600 rounded-full text-2xl font-bold mb-4"
            aria-hidden="true"
          >
            {getInitials()}
          </div>
        )}
        <p className="text-xl font-bold text-slate-900 mb-1">
          {client.name}
        </p>
        <p className="font-medium" style={{ fontSize: '14px', color: '#6B7280' }}>{roleLabel} Wallfin</p>
      </section>

      <section
        aria-labelledby="info-heading"
        className="bg-white rounded-xl p-6 mb-4 shadow-sm"
      >
        <h2 id="info-heading" className="text-lg font-bold text-slate-900 mb-4">
          Informations personnelles
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Mail className="w-6 h-6 text-slate-500 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <label
                htmlFor={emailId}
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <p id={emailId} className="text-base font-medium text-slate-900">
                {client.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Shield className="w-6 h-6 text-slate-500 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Role</p>
              <p className="text-base font-medium text-slate-900">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Calendar className="w-6 h-6 text-slate-500 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Membre depuis</p>
              <p className="text-base font-medium text-slate-900">{memberSince}</p>
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={handleLogout}
        aria-label="Se deconnecter de l'espace client"
        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-3 transition-colors"
        style={{ height: '52px' }}
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        <span className="font-semibold text-base">Se deconnecter</span>
      </button>
    </div>
  );
}
