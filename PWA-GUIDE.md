# Guide PWA - Wallfin Espace Client

Votre application Wallfin est maintenant une **Progressive Web App (PWA)** complète avec support des notifications push.

## Fonctionnalités PWA

### Installation
- **Sur mobile** : Un banner d'installation apparaît automatiquement après 3 secondes
- **Sur desktop** : Icône d'installation dans la barre d'adresse (Chrome, Edge, Safari)
- L'application peut être installée et utilisée comme une app native

### Mode Hors Ligne
- Fonctionne sans connexion internet (cache intelligent)
- Page hors ligne personnalisée avec le logo Wallfin
- Les données sont sauvegardées localement via Supabase

### Notifications Push
- Support complet des notifications push via le service worker
- Demande automatique de permission lors de la première utilisation
- Icônes personnalisées et vibrations

## Utilisation du Hook `useNotifications`

### Import
```typescript
import { useNotifications } from './hooks/useNotifications';
```

### Exemple d'utilisation
```typescript
function MonComposant() {
  const {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush
  } = useNotifications();

  // Demander la permission
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      console.log('Permission accordée');
    }
  };

  // Afficher une notification
  const handleShowNotification = async () => {
    await showNotification({
      title: 'Nouveau crédit',
      body: 'Votre demande a été approuvée',
      icon: '/icons/icon-192x192.svg',
      tag: 'credit-approved',
      data: { url: '/credits' }
    });
  };

  // S'abonner aux notifications push
  const handleSubscribe = async () => {
    const subscription = await subscribeToPush();
    // Envoyer subscription à votre backend
  };

  return (
    <div>
      <button onClick={handleRequestPermission}>
        Activer les notifications
      </button>
      <button onClick={handleShowNotification}>
        Tester une notification
      </button>
    </div>
  );
}
```

## Configuration des Notifications Push

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :
```env
VITE_VAPID_PUBLIC_KEY=votre_clé_publique_vapid
```

### 2. Générer des clés VAPID

Utilisez le package `web-push` pour générer vos clés :
```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 3. Backend pour les notifications

Créez un endpoint dans votre backend pour envoyer des notifications :

```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@wallfin.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Envoyer une notification
const subscription = {
  endpoint: '...',
  keys: { p256dh: '...', auth: '...' }
};

const payload = JSON.stringify({
  title: 'Wallfin',
  body: 'Nouveau crédit approuvé',
  icon: '/icons/icon-192x192.svg',
  data: { url: '/credits' }
});

await webpush.sendNotification(subscription, payload);
```

## Hook `usePWAInstall`

Le hook `usePWAInstall` gère l'installation de l'application.

```typescript
import { usePWAInstall } from './hooks/usePWAInstall';

function MonComposant() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installée !');
    }
  };

  if (isInstalled) {
    return <div>App déjà installée</div>;
  }

  if (isInstallable) {
    return (
      <button onClick={handleInstall}>
        Installer l'application
      </button>
    );
  }

  return null;
}
```

## Composant `InstallBanner`

Le composant `InstallBanner` est déjà intégré et s'affiche automatiquement :
- Après 3 secondes de navigation
- Uniquement si l'app n'est pas installée
- Peut être fermé (réapparaît après 24h)

```typescript
import { InstallBanner } from './components/PWA/InstallBanner';

function App() {
  return (
    <div>
      {/* Votre contenu */}
      <InstallBanner />
    </div>
  );
}
```

## Manifest PWA

Fichier : `public/manifest.json`

Configuration actuelle :
- **Nom** : Wallfin - Espace Client
- **Couleur principale** : #FF9500 (Orange)
- **Mode** : standalone (fullscreen sans barre d'adresse)
- **Icônes** : SVG adaptatives (72px, 192px, 512px)
- **Shortcuts** : Accès rapide aux Crédits et Demandes

## Service Worker

Fichier : `public/sw.js`

Fonctionnalités :
- **Cache strategy** : Network-first avec fallback cache
- **Offline fallback** : Page hors ligne personnalisée
- **Push notifications** : Écoute et affichage des notifications
- **Auto-update** : Nettoyage automatique des anciens caches

## Tester la PWA

### 1. Build et preview
```bash
npm run build
npm run preview
```

### 2. DevTools (Chrome/Edge)
1. Ouvrir DevTools (F12)
2. Onglet **Application**
3. Sections à vérifier :
   - **Manifest** : Configuration PWA
   - **Service Workers** : État du service worker
   - **Cache Storage** : Fichiers en cache
   - **Notifications** : Tester les permissions

### 3. Lighthouse Audit
1. DevTools > Lighthouse
2. Sélectionner "Progressive Web App"
3. Générer le rapport
4. Score cible : 90+/100

### 4. Test sur mobile
```bash
npm run build:mobile
npx cap open ios
# ou
npx cap open android
```

## Troubleshooting

### Notifications ne fonctionnent pas
- Vérifier que HTTPS est activé (requis pour PWA)
- Vérifier les permissions du navigateur
- Vérifier la console pour les erreurs
- Tester avec `showNotification` avant les push

### Service Worker ne se met pas à jour
```javascript
// Forcer la mise à jour
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

### Cache problématique
```javascript
// Vider le cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Ressources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web Push Protocol](https://web.dev/push-notifications-web-push-protocol/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## Support Navigateurs

| Navigateur | Installation | Notifications | Service Worker |
|------------|--------------|---------------|----------------|
| Chrome     | ✅           | ✅            | ✅             |
| Edge       | ✅           | ✅            | ✅             |
| Safari     | ✅           | ⚠️ (iOS 16+)  | ✅             |
| Firefox    | ✅           | ✅            | ✅             |
| Opera      | ✅           | ✅            | ✅             |

✅ Support complet | ⚠️ Support partiel | ❌ Non supporté
