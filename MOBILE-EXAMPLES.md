# Exemples Rapides - Mobile

Snippets de code prêts à l'emploi pour les fonctionnalités mobiles.

## Détecter la Plateforme

```tsx
import { useIsMobile } from './hooks/useIsMobile';

function MyButton() {
  const { isIOS, isAndroid, isNative } = useIsMobile();

  return (
    <button className={isIOS ? 'rounded-lg' : 'rounded-md'}>
      {isNative ? 'App Native' : 'Version Web'}
    </button>
  );
}
```

## Bouton avec Haptic Feedback

```tsx
import { hapticsService } from './services/HapticsService';

<button
  onClick={async () => {
    await hapticsService.impact('medium');
    handleAction();
  }}
  className="btn-mobile bg-orange-500 text-white rounded-lg"
>
  Confirmer
</button>
```

## Notification Locale

```tsx
import { notificationService } from './services/NotificationService';

async function handleFormSuccess() {
  await notificationService.sendLocalNotification(
    'Demande envoyée',
    'Votre demande a été envoyée avec succès'
  );
}
```

## Container avec Safe Areas

```tsx
function MyScreen() {
  return (
    <div className="min-h-screen-safe safe-area-inset bg-white">
      {/* Contenu qui respecte les safe areas iOS */}
    </div>
  );
}
```

## Navigation Bottom avec Safe Area

```tsx
function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-safe bg-white border-t">
      <div className="flex justify-around py-2">
        {/* Navigation items */}
      </div>
    </nav>
  );
}
```

## Demander les Permissions Notifications

```tsx
import { notificationService } from './services/NotificationService';

function NotificationSettings() {
  const [granted, setGranted] = useState(false);

  const handleRequestPermissions = async () => {
    const result = await notificationService.requestPermissions();
    setGranted(result);
  };

  return (
    <button onClick={handleRequestPermissions} className="btn-mobile">
      {granted ? 'Notifications activées' : 'Activer les notifications'}
    </button>
  );
}
```

## Feedback Visuel + Haptique sur Succès

```tsx
import { hapticsService } from './services/HapticsService';

async function handleSuccess() {
  await hapticsService.notification('success');

  // Afficher un message de succès
  setShowSuccess(true);
}

async function handleError() {
  await hapticsService.notification('error');

  // Afficher un message d'erreur
  setShowError(true);
}
```

## Liste Scrollable avec Overscroll Disabled

```tsx
<div className="h-screen overflow-y-auto overscroll-none">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>
```

## Input Mobile-Friendly

```tsx
<input
  type="text"
  className="w-full px-4 py-3 text-base rounded-lg border"
  placeholder="Entrez votre texte"
  style={{ fontSize: '16px' }}
/>
```

## Bouton Retour Custom (Android)

```tsx
import { useEffect } from 'react';
import { App } from '@capacitor/app';

function MyScreen() {
  useEffect(() => {
    const listener = App.addListener('backButton', () => {
      // Action personnalisée
      handleGoBack();
    });

    return () => {
      listener.remove();
    };
  }, []);

  return <div>Contenu</div>;
}
```

## Adapter UI selon la Plateforme

```tsx
import { useIsMobile } from './hooks/useIsMobile';

function AdaptiveButton() {
  const { platform } = useIsMobile();

  const buttonStyle = {
    ios: 'rounded-xl shadow-sm',
    android: 'rounded-lg shadow-md',
    web: 'rounded-lg shadow',
  };

  return (
    <button className={`btn-mobile ${buttonStyle[platform]}`}>
      Bouton Adaptatif
    </button>
  );
}
```

## Gérer le Clavier

```tsx
import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { useIsMobile } from './hooks/useIsMobile';

function ChatInput() {
  const { isNative } = useIsMobile();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isNative) return;

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setKeyboardHeight(info.keyboardHeight);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [isNative]);

  return (
    <div style={{ marginBottom: keyboardHeight }}>
      <input type="text" placeholder="Message..." />
    </div>
  );
}
```

## Card Mobile-Optimized

```tsx
function CreditCard({ credit }) {
  const { isMobile } = useIsMobile();

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg p-4
        tap-highlight-transparent touch-manipulation
        ${isMobile ? 'min-h-[80px]' : 'min-h-[100px]'}
      `}
    >
      {/* Contenu */}
    </div>
  );
}
```

## Modal Full-Screen Mobile

```tsx
import { useIsMobile } from './hooks/useIsMobile';

function Modal({ isOpen, onClose }) {
  const { isMobile } = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className={isMobile ? 'fixed inset-0 safe-area-inset' : 'fixed inset-0'}>
      <div className={isMobile ? 'h-full' : 'max-w-2xl mx-auto mt-20'}>
        {/* Contenu du modal */}
      </div>
    </div>
  );
}
```
