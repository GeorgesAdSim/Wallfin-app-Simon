import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, LogOut, ChevronRight, X, Check, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/format';
import { AdminMessages } from '../Admin/AdminMessages';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function Profile() {
  const { setAuthenticated, navigateTo } = useApp();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigateTo('login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        navigateTo('login');
        return;
      }

      setProfile(data as ProfileData);
    } catch {
      navigateTo('login');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const firstName = profile.name?.split(' ')[0] || '';
  const lastName = profile.name?.split(' ').slice(1).join(' ') || '';
  const initials = `${firstName[0] || ''}${lastName[0] || firstName[1] || ''}`.toUpperCase();

  const profileItems = [
    { icon: User, label: 'Nom complet', value: profile.name || 'Non renseigne' },
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Telephone', value: profile.phone || 'Non renseigne' },
    { icon: Calendar, label: 'Membre depuis', value: formatDate(profile.created_at) },
    { icon: Shield, label: 'Role', value: profile.role === 'admin' ? 'Administrateur' : profile.role === 'manager' ? 'Manager' : 'Client' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  const handleEdit = () => {
    setEditData({
      name: profile.name || '',
      phone: profile.phone || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name.trim(),
          phone: editData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (!error) {
        setProfile((prev) => prev ? {
          ...prev,
          name: editData.name.trim(),
          phone: editData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        } : prev);
        setIsEditing(false);
      }
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telephone</label>
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              placeholder="+32 4XX XX XX XX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">
              <strong>Note :</strong> L'email ne peut pas etre modifie depuis cette interface.
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
            disabled={isSaving || !editData.name.trim()}
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
            {initials}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
        <p className="text-sm text-gray-500">Client depuis {formatDate(profile.created_at)}</p>
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
        Derniere mise a jour : {formatDate(profile.updated_at)}
      </p>

      {profile.role === 'admin' && (
        <div className="mt-6">
          <AdminMessages />
        </div>
      )}
    </div>
  );
}
