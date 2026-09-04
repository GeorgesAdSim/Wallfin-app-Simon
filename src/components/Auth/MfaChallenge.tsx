import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export function MfaChallenge() {
  const { completeMfaChallenge, setAuthenticated } = useApp();
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === 'verified');
      if (totp) setFactorId(totp.id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setIsLoading(true);
    setError('');

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });

    setIsLoading(false);

    if (verifyError) {
      setError('Code incorrect. Réessayez.');
    } else {
      completeMfaChallenge();
    }
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <img
              src="/images_(3).png"
              alt="Wallfin"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900">Wallfin</div>
              <div className="text-sm text-slate-600">Espace Client</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Vérification en deux étapes
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Entrez le code généré par votre application d'authentification
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-700 mb-2">
                Code à 6 chiffres
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !factorId}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Vérification...' : 'Valider'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              Annuler et se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
