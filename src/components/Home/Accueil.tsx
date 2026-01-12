import { useApp } from '../../context/AppContext';
import { Mail, Phone, MapPin, LogOut, Edit, Check, X } from 'lucide-react';
import { useState, useEffect, useId } from 'react';

export function Accueil() {
  const { client, setAuthenticated, updateClient } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [showToast, setShowToast] = useState(false);

  const emailId = useId();
  const phoneId = useId();
  const addressId = useId();

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
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <Check className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Vos informations ont ete mises a jour</span>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon compte</h1>

      <section
        aria-labelledby="profile-heading"
        className="bg-white rounded-xl p-6 mb-4 shadow-sm text-center"
      >
        <h2 id="profile-heading" className="sr-only">Profil utilisateur</h2>
        <div
          className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-600 rounded-full text-2xl font-bold mb-4"
          aria-hidden="true"
        >
          {getInitials()}
        </div>
        <p className="text-xl font-bold text-slate-900 mb-1">
          {client.first_name} {client.last_name}
        </p>
        <p className="text-sm font-medium text-slate-700">Client Wallfin</p>
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
              {isEditing ? (
                <input
                  id={emailId}
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full text-base font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 min-h-[48px]"
                />
              ) : (
                <p id={emailId} className="text-base font-medium text-slate-900">
                  {client.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Phone className="w-6 h-6 text-slate-500 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <label
                htmlFor={phoneId}
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Telephone
              </label>
              {isEditing ? (
                <input
                  id={phoneId}
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="w-full text-base font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 min-h-[48px]"
                />
              ) : (
                <p id={phoneId} className="text-base font-medium text-slate-900">
                  {client.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <MapPin className="w-6 h-6 text-slate-500 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <label
                htmlFor={addressId}
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Adresse
              </label>
              {isEditing ? (
                <input
                  id={addressId}
                  type="text"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  className="w-full text-base font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 min-h-[48px]"
                />
              ) : (
                <p id={addressId} className="text-base font-medium text-slate-900">
                  {client.address || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCancel}
              aria-label="Annuler les modifications"
              className="flex-1 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg min-h-[48px] flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <X className="w-5 h-5" aria-hidden="true" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              aria-label="Enregistrer les modifications"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg min-h-[48px] flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Check className="w-5 h-5" aria-hidden="true" />
              Enregistrer
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            aria-label="Modifier mes informations personnelles"
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg min-h-[48px] flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Edit className="w-5 h-5" aria-hidden="true" />
            Modifier mes informations
          </button>
        )}
      </section>

      <button
        onClick={handleLogout}
        aria-label="Se deconnecter de l'espace client"
        className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl min-h-[56px] flex items-center justify-center gap-3 transition-colors"
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        <span className="font-semibold text-base">Se deconnecter</span>
      </button>
    </div>
  );
}
