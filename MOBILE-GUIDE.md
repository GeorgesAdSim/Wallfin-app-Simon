# Guide de Développement Mobile - Wallfin

Ce guide explique comment utiliser les fonctionnalités mobiles dans l'application Wallfin.

## Table des Matières

1. [Hook useIsMobile](#hook-useismobile)
2. [Service de Notifications](#service-de-notifications)
3. [Service Haptics](#service-haptics)
4. [Safe Areas iOS](#safe-areas-ios)
5. [Bonnes Pratiques Mobile](#bonnes-pratiques-mobile)

---

## Hook useIsMobile

Le hook `useIsMobile` détecte la plateforme et la taille de l'écran.

### Utilisation

```typescript
import { useIsMobile } from '../hooks/useIsMobile';

function MyComponent() {
  const { isNative, isIOS, isAndroid, isWeb, isMobile, platform } = useIsMobile();

  if (isIOS) {
    // Code spécifique iOS
  }

  if (isAndroid) {
    // Code spécifique Android
  }

  if (isNative) {
    // Code pour app native (iOS ou Android)
  }

  if (isWeb) {
    // Code pour navigateur web
  }

  return (
    <div>
      <p>Plateforme: {platform}</p>
      <p>Est mobile: {isMobile ? 'Oui' : 'Non'}</p>
    </div>
  );
}
```

### Valeurs Retournées

- `isNative`: `boolean` - True si l'app tourne sur iOS ou Android
- `isIOS`: `boolean` - True si iOS
- `isAndroid`: `boolean` - True si Android
- `isWeb`: `boolean` - True si navigateur web
- `isMobile`: `boolean` - True si native OU écran < 768px
- `platform`: `'ios' | 'android' | 'web'` - Nom de la plateforme
- `screenWidth`: `number` - Largeur de l'écran en pixels
- `screenHeight`: `number` - Hauteur de l'écran en pixels

---

## Service de Notifications

Le service `NotificationService` gère les notifications push et locales sur toutes les plateformes.

### Initialisation

Le service est automatiquement initialisé dans `App.tsx`. Pas besoin de l'initialiser manuellement.

### Demander les Permissions

```typescript
import { notificationService } from '../services/NotificationService';

async function requestNotifications() {
  const granted = await notificationService.requestPermissions();

  if (granted) {
    console.log('Notifications autorisées');
  } else {
    console.log('Notifications refusées');
  }
}
```

### Vérifier les Permissions

```typescript
const status = await notificationService.checkPermissions();

if (status.granted) {
  console.log('Notifications activées');
}

if (status.denied) {
  console.log('Notifications désactivées');
}
```

### Envoyer une Notification Locale

```typescript
// Notification immédiate
await notificationService.sendLocalNotification(
  'Nouveau message',
  'Vous avez reçu un nouveau message'
);

// Notification planifiée
const futureDate = new Date();
futureDate.setHours(futureDate.getHours() + 1);

await notificationService.scheduleLocalNotification(
  'Rappel',
  'N\'oubliez pas de vérifier vos crédits',
  futureDate
);
```

### Obtenir le Token Push (pour notifications serveur)

```typescript
const token = notificationService.getToken();
console.log('Push token:', token);
```

---

## Service Haptics

Le service `HapticsService` gère les vibrations et retours haptiques sur toutes les plateformes.

### Utilisation

```typescript
import { hapticsService } from '../services/HapticsService';

// Vibration légère (ex: sélection d'un élément)
await hapticsService.impact('light');

// Vibration moyenne (ex: bouton cliqué)
await hapticsService.impact('medium');

// Vibration forte (ex: action importante)
await hapticsService.impact('heavy');

// Feedback de succès
await hapticsService.notification('success');

// Feedback d'avertissement
await hapticsService.notification('warning');

// Feedback d'erreur
await hapticsService.notification('error');

// Feedback de sélection
await hapticsService.selection();

// Vibration personnalisée (durée en ms)
await hapticsService.vibrate(100);
```

### Exemples Pratiques

```typescript
// Bouton cliqué
<button
  onClick={async () => {
    await hapticsService.impact('medium');
    // Action du bouton
  }}
>
  Cliquez-moi
</button>

// Formulaire soumis avec succès
const handleSubmit = async () => {
  try {
    await submitForm();
    await hapticsService.notification('success');
  } catch (error) {
    await hapticsService.notification('error');
  }
};

// Navigation entre onglets
const handleTabChange = async (tab) => {
  await hapticsService.selection();
  setActiveTab(tab);
};
```

---

## Safe Areas iOS

Les Safe Areas permettent de gérer le notch, la Dynamic Island et les coins arrondis sur iOS.

### Classes CSS Disponibles

```css
/* Padding pour chaque côté */
.safe-top       /* padding-top avec safe area */
.safe-bottom    /* padding-bottom avec safe area */
.safe-left      /* padding-left avec safe area */
.safe-right     /* padding-right avec safe area */

/* Padding sur tous les côtés */
.safe-area-inset

/* Hauteur de la safe area bottom */
.h-safe-area-inset-bottom

/* Padding/Margin bottom avec safe area */
.pb-safe
.mb-safe

/* Hauteur d'écran avec safe areas */
.min-h-screen-safe
.h-screen-safe
```

### Exemples d'Utilisation

```jsx
// Navigation du bas qui respecte la safe area
<nav className="fixed bottom-0 left-0 right-0 pb-safe bg-white">
  {/* Contenu */}
</nav>

// Header qui respecte la safe area du haut
<header className="safe-top bg-orange-500">
  {/* Contenu */}
</header>

// Conteneur full-screen avec safe areas
<div className="safe-area-inset min-h-screen-safe">
  {/* Contenu */}
</div>
```

---

## Bonnes Pratiques Mobile

### 1. Taille des Boutons

Les boutons doivent avoir **minimum 44x44px** (recommandation Apple/Android).

```jsx
// Utilisez la classe btn-mobile
<button className="btn-mobile bg-orange-500 text-white rounded-lg">
  Cliquer
</button>

// Ou définissez manuellement
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
  Cliquer
</button>
```

### 2. Taille des Polices

Les inputs doivent avoir **minimum 16px** pour éviter le zoom automatique sur iOS.

```jsx
// ✅ Bon - Pas de zoom
<input type="text" className="text-base" /> {/* 16px */}

// ❌ Mauvais - Zoom automatique
<input type="text" className="text-sm" /> {/* 14px */}
```

### 3. Gestion du Clavier

Le clavier est automatiquement géré par Capacitor. Pour plus de contrôle:

```typescript
import { Keyboard } from '@capacitor/keyboard';

// Masquer le clavier
await Keyboard.hide();

// Afficher le clavier (focus sur un input)
inputRef.current?.focus();

// Écouter les événements clavier
Keyboard.addListener('keyboardWillShow', (info) => {
  console.log('Clavier visible, hauteur:', info.keyboardHeight);
});

Keyboard.addListener('keyboardWillHide', () => {
  console.log('Clavier masqué');
});
```

### 4. Prévenir le Zoom iOS

```jsx
// Dans les meta tags (déjà fait dans index.html)
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
```

### 5. Désactiver la Sélection de Texte

```css
.no-select {
  -webkit-user-select: none;
  user-select: none;
}
```

### 6. Optimiser les Transitions

```jsx
// Utiliser transform au lieu de top/left pour de meilleures performances
<div className="transition-transform duration-300 transform translate-x-0 hover:translate-x-2">
  {/* Contenu */}
</div>
```

### 7. Gestion du Bouton Retour Android

Le bouton retour est automatiquement géré dans `App.tsx`:
- Si `canGoBack` → `window.history.back()`
- Sinon → Quitter l'app

### 8. Status Bar

La Status Bar est configurée automatiquement:
- **iOS**: Style light (texte blanc) sur fond orange
- **Android**: Fond orange (#f97316)

Pour la modifier:

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Changer le style
await StatusBar.setStyle({ style: Style.Dark });

// Changer la couleur (Android uniquement)
await StatusBar.setBackgroundColor({ color: '#000000' });

// Masquer/Afficher
await StatusBar.hide();
await StatusBar.show();
```

### 9. Splash Screen

Le Splash Screen est automatiquement masqué au démarrage. Pour le contrôler:

```typescript
import { SplashScreen } from '@capacitor/splash-screen';

// Afficher
await SplashScreen.show();

// Masquer
await SplashScreen.hide();
```

### 10. Détecter l'État de l'App

```typescript
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    console.log('App au premier plan');
    // Rafraîchir les données
  } else {
    console.log('App en arrière-plan');
    // Sauvegarder l'état
  }
});
```

---

## Checklist Mobile

Avant de déployer sur mobile, vérifiez:

- [ ] Tous les boutons font minimum 44x44px
- [ ] Les inputs ont une taille de police ≥ 16px
- [ ] La navigation respecte les safe areas iOS
- [ ] Les notifications sont fonctionnelles
- [ ] Le retour haptique fonctionne
- [ ] Le bouton retour Android fonctionne correctement
- [ ] La Status Bar a les bonnes couleurs
- [ ] Le Splash Screen s'affiche correctement
- [ ] L'app fonctionne hors ligne (si applicable)
- [ ] Les transitions sont fluides (60 FPS)
- [ ] Testé sur iPhone avec notch
- [ ] Testé sur Android avec différentes tailles

---

## Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://m3.material.io/)
- [Safe Area Documentation](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
