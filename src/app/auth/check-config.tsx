'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Composant de vérification de la configuration Firebase
 * Affiche l'état de la configuration et des instructions
 */
export function FirebaseConfigChecker() {
  const [checks, setChecks] = useState<{
    domain: string;
    authDomain: string;
    projectId: string;
    apiKey: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && auth) {
      const domain = window.location.hostname;
      const config = {
        domain,
        authDomain: auth.app.options.authDomain || 'N/A',
        projectId: auth.app.options.projectId || 'N/A',
        apiKey: auth.app.options.apiKey?.substring(0, 20) + '...' || 'N/A',
      };
      setChecks(config);
    }
  }, []);

  if (!checks) return null;

  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${checks.projectId}/authentication/providers`;

  return (
    <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
      <AlertCircle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500 font-semibold">
        Vérification de la Configuration Firebase
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="text-sm text-white/90">
          <p className="mb-2">
            <strong>Domaine actuel:</strong> <code className="bg-black/30 px-2 py-1 rounded">{checks.domain}</code>
          </p>
          <p className="mb-2">
            <strong>Project ID:</strong> <code className="bg-black/30 px-2 py-1 rounded">{checks.projectId}</code>
          </p>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-black/30 rounded text-xs space-y-1">
            <p><strong>Auth Domain:</strong> {checks.authDomain}</p>
            <p><strong>API Key:</strong> {checks.apiKey}</p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            {showDetails ? 'Masquer' : 'Afficher'} détails
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(firebaseConsoleUrl, '_blank')}
            className="text-xs"
          >
            Ouvrir Firebase Console
          </Button>
        </div>

        <div className="mt-3 text-xs text-white/70 space-y-1">
          <p className="font-semibold">⚠️ Vérifiez dans Firebase Console:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Authentication → Sign-in method → Phone : <strong>ACTIVÉ</strong></li>
            <li>Authentication → Settings → Authorized domains : <code>{checks.domain}</code> doit être présent</li>
            <li>Authentication → Settings → reCAPTCHA : Configuré</li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  );
}



