import { useApp } from '../../context/AppContext';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut } from 'lucide-react';

export function SimpleProfile() {
  const { client, navigateTo, setAuthenticated } = useApp();

  if (!client) {
    navigateTo('login');
    return null;
  }

  const handleLogout = () => {
    setAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon profil</h1>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Informations personnelles</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-slate-600 mb-1">Nom complet</div>
                <div className="font-medium text-slate-900">
                  {client.first_name} {client.last_name}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-slate-600 mb-1">Email</div>
                <div className="font-medium text-slate-900">{client.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-slate-600 mb-1">Téléphone</div>
                <div className="font-medium text-slate-900">{client.phone}</div>
              </div>
            </div>

            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-1">Adresse</div>
                  <div className="font-medium text-slate-900">{client.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center gap-3 transition-colors"
          style={{ height: '52px' }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Se deconnecter</span>
        </button>
      </div>

      <div className="mt-12 py-6 border-t border-slate-200 text-center text-sm text-slate-600">
        © 2025 Wallfin - Courtier en crédit | +32 4 228 19 42 | wallfin.be
      </div>
    </div>
  );
}
