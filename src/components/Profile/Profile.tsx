import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, LogOut, ChevronRight, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';

export function Profile() {
  const { client, setAuthenticated, updateClient } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: client?.first_name || '',
    last_name: client?.last_name || '',
    phone: client?.phone || '',
    address: client?.address || '',
    gender: client?.gender || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!client) {
    return null;
  }

  const profileItems = [
    { icon: User, label: 'Nom complet', value: `${client.first_name} ${client.last_name}` },
    { icon: Mail, label: 'Email', value: client.email },
    { icon: Phone, label: 'Telephone', value: client.phone || 'Non renseigne' },
    { icon: MapPin, label: 'Adresse', value: client.address || 'Non renseignee' },
    { icon: Calendar, label: 'Date de naissance', value: client.birth_date ? formatDate(client.birth_date) : 'Non renseignee' },
    { icon: Shield, label: 'Sexe', value: client.gender === 'M' ? 'Homme' : client.gender === 'F' ? 'Femme' : 'Non renseigne' },
  ];

  const handleLogout = () => {
    setAuthenticated(false);
  };

  const handleEdit = () => {
    setEditData({
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone || '',
      address: client.address || '',
      gender: client.gender || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateClient(editData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Modifier mes informations</h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prenom</label>
              <input
                type="text"
                value={editData.first_name}
                onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={editData.last_name}
                onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telephone</label>
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              placeholder="+32 470 12 34 56"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              placeholder="Rue, numero, code postal, ville"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
            <select
              value={editData.gender}
              onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white"
            >
              <option value="">Non renseigne</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">
              <strong>Note :</strong> L'email et la date de naissance ne peuvent pas etre modifies depuis cette interface.
              Contactez le service client pour toute modification.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">
            {client.first_name[0]}{client.last_name[0]}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
        <p className="text-sm text-gray-500">Client depuis {formatDate(client.created_at)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {profileItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={handleEdit}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-900">Modifier mes informations</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Se deconnecter</span>
      </button>

      <p className="text-xs text-gray-400 text-center">
        Derniere mise a jour : {formatDate(client.updated_at)}
      </p>
    </div>
  );
}
