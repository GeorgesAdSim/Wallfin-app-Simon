import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, ShieldOff } from 'lucide-react';

type Factor = { id: string; friendly_name?: string | null; status: string };

export function MfaSettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [pendingFactorId, setPendingFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []).filter((f) => f.status === 'verified'));
  }, []);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const startEnroll = async () => {
    setError('');
    setIsLoading(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setIsLoading(false);

    if (enrollError || !data) {
      setError("Erreur lors de l'activation. Réessayez.");
      return;
    }

    setPendingFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolling(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    });

    if (challengeError || !challenge) {
      setIsLoading(false);
      setError('Erreur lors de la vérification. Réessayez.');
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code: code.trim(),
    });

    setIsLoading(false);

    if (verifyError) {
      setError('Code incorrect. Réessayez.');
    } else {
      setEnrolling(false);
      setCode('');
      setQrCode('');
      setSecret('');
      loadFactors();
    }
  };

  const handleCancelEnroll = async () => {
    if (pendingFactorId) {
      await supabase.auth.mfa.unenroll({ factorId: pendingFactorId });
    }
    setEnrolling(false);
    setQrCode('');
    setSecret('');
    setCode('');
    setError('');
  };

  const handleDisable = async (factorId: string) => {
    setIsLoading(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setIsLoading(false);
    loadFactors();
  };

  return (
    <section
      aria-labelledby="mfa-heading"
      className="bg-white rounded-xl p-6 mb-4 shadow-sm"
    >
      <h2 id="mfa-heading" className="text-lg font-bold text-slate-900 mb-4">
        Double authentification
      </h2>

      {factors.length > 0 && !enrolling && (
        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-600" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-900">Activée</span>
              </div>
              <button
                onClick={() => handleDisable(f.id)}
                disabled={isLoading}
                className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
              >
                Désactiver
              </button>
            </div>
          ))}
        </div>
      )}

      {factors.length === 0 && !enrolling && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <ShieldOff className="w-6 h-6 text-slate-500" aria-hidden="true" />
            <p className="text-sm text-slate-700">
              Ajoutez une couche de sécurité supplémentaire avec une application d'authentification (Google Authenticator, Authy...).
            </p>
          </div>
          <button
            onClick={startEnroll}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Activer la double authentification'}
          </button>
        </div>
      )}

      {enrolling && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div
            className="flex justify-center bg-white p-4 rounded-lg border border-slate-200"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
          <p className="text-xs text-slate-500 text-center break-all">
            Ou entrez ce code manuellement : <span className="font-mono">{secret}</span>
          </p>

          <div>
            <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-slate-700 mb-2">
              Code de vérification
            </label>
            <input
              id="mfa-verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancelEnroll}
              className="flex-1 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg py-3 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Vérification...' : 'Valider'}
            </button>
          </div>
        </form>
      )}

      {error && !enrolling && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}
    </section>
  );
}
