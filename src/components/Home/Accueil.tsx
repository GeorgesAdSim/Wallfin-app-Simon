import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, LogOut, Edit, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Accueil() {
  const { client, setAuthenticated, updateClient } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (client) {
      setEditedEmail(client.email);
      setEditedPhone(client.phone);
      setEditedAddress(client.address || '');
    }
  }, [client]);

  if (!client) return null;

  const handleLogout = () => {
    setAuthenticated(false);
  };

  const getInitials = () => {
    return `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedEmail(client.email);
    setEditedPhone(client.phone);
    setEditedAddress(client.address || '');
    setIsEditing(false);
  };

  const handleSave = () => {
    const updates = {
      email: editedEmail,
      phone: editedPhone,
      address: editedAddress,
    };

    updateClient(updates);
    localStorage.setItem('client', JSON.stringify({ ...client, ...updates }));

    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="pb-20 px-4 py-6">
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">Vos informations ont été mises à jour</span>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon compte</h1>

      <div className="bg-white rounded-xl p-6 mb-4 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-600 rounded-full text-2xl font-bold mb-4">
          {getInitials()}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {client.first_name} {client.last_name}
        </h2>
        <p className="text-sm text-slate-600">Client Wallfin</p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Informations personnelles</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-1">Email</div>
              {isEditing ? (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <div className="font-medium text-slate-900">{client.email}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-1">Téléphone</div>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="w-full font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <div className="font-medium text-slate-900">{client.phone}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-1">Adresse</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  className="w-full font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <div className="font-medium text-slate-900">{client.address || '-'}</div>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Check className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            Modifier mes informations
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Se déconnecter</span>
      </button>
    </div>
  );
}
