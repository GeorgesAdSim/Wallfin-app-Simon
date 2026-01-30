# Configuration Mobile - Wallfin App

Ce guide explique comment configurer et lancer l'application Wallfin sur iOS et Android.

## Configuration Capacitor

**App ID**: `com.wallfin.client`
**App Name**: Wallfin
**Web Directory**: dist
**Theme Color**: #FF9500 (Orange)

## Prerequisites

### Pour iOS (Mac uniquement)

1. **Installer Xcode**
   - Ouvrir l'App Store sur votre Mac
   - Rechercher "Xcode"
   - Cliquer sur "Obtenir" ou "Telecharger"
   - Attendre la fin du telechargement (environ 12 GB)
   - Ouvrir Xcode une premiere fois pour accepter les termes
   - Installer les Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Installer CocoaPods** (gestionnaire de dependances iOS)
   ```bash
   sudo gem install cocoapods
   ```

3. **Verifier l'installation**
   ```bash
   xcode-select -p
   # Devrait afficher: /Applications/Xcode.app/Contents/Developer

   pod --version
   # Devrait afficher la version de CocoaPods
   ```

### Pour Android (Mac, Linux, Windows)

1. **Installer Android Studio**
   - Telecharger depuis: https://developer.android.com/studio
   - Installer l'application
   - Au premier lancement, suivre l'assistant de configuration
   - Installer les composants suivants:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

2. **Configurer les variables d'environnement**

   Ajouter au fichier `~/.zshrc` ou `~/.bash_profile`:

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

   Puis recharger:
   ```bash
   source ~/.zshrc  # ou source ~/.bash_profile
   ```

3. **Verifier l'installation**
   ```bash
   adb --version
   # Devrait afficher la version d'ADB
   ```

## Scripts NPM Disponibles

```bash
# Build pour mobile et synchroniser les plateformes
npm run build:mobile

# Ouvrir le projet iOS dans Xcode
npm run ios:dev

# Ouvrir le projet Android dans Android Studio
npm run android:dev

# Synchroniser uniquement (sans rebuild)
npm run sync

# Synchroniser iOS uniquement
npm run ios:sync

# Synchroniser Android uniquement
npm run android:sync
```

## Premier Lancement

### iOS

1. **Build et ouvrir Xcode**
   ```bash
   npm run ios:dev
   ```

2. **Dans Xcode**:
   - Selectionner votre equipe de developpement (Apple ID)
   - Selectionner un simulateur ou un appareil physique
   - Cliquer sur le bouton Play (▶) pour lancer l'app

3. **Configuration des Notifications Push** (optionnel):
   - Dans Xcode, aller dans "Signing & Capabilities"
   - Cliquer sur "+ Capability"
   - Ajouter "Push Notifications"
   - Ajouter "Background Modes" et cocher "Remote notifications"

### Android

1. **Build et ouvrir Android Studio**
   ```bash
   npm run android:dev
   ```

2. **Dans Android Studio**:
   - Attendre la synchronisation Gradle (premiere fois peut etre longue)
   - Creer ou demarrer un emulateur Android (AVD Manager)
   - Cliquer sur le bouton Run (▶) pour lancer l'app

3. **Configuration des Notifications Push** (optionnel):
   - Creer un projet Firebase: https://console.firebase.google.com
   - Ajouter une app Android avec le package `com.wallfin.client`
   - Telecharger le fichier `google-services.json`
   - Placer le fichier dans `android/app/`
   - Le fichier sera automatiquement configure

## Workflow de Developpement

### Developpement avec Hot Reload (Web)

```bash
# Developper normalement avec Vite
npm run dev
# Ouvrir http://localhost:5173
```

### Test sur Mobile

Apres chaque modification importante:

```bash
# 1. Build le projet React
npm run build

# 2. Synchroniser avec les plateformes natives
npm run sync

# 3. Relancer l'app depuis Xcode ou Android Studio
```

Ou en une commande:
```bash
npm run build:mobile
```

## Plugins Capacitor Installes

Les plugins suivants sont configures et prets a l'emploi:

- **@capacitor/app** - Gestion du cycle de vie de l'app
- **@capacitor/keyboard** - Gestion du clavier
- **@capacitor/push-notifications** - Notifications push natives
- **@capacitor/local-notifications** - Notifications locales
- **@capacitor/splash-screen** - Ecran de demarrage
- **@capacitor/status-bar** - Personnalisation de la barre de statut
- **@capacitor/haptics** - Retour haptique (vibrations)

## Hook useCapacitorNotifications

Un hook React personnalisé est disponible pour simplifier l'utilisation des notifications:

```typescript
import { useCapacitorNotifications } from './hooks/useCapacitorNotifications';

function MonComposant() {
  const {
    isNative,              // true si app native, false si web
    hasPermission,         // true si permission accordée
    pushToken,            // Token FCM/APNs pour push serveur
    requestPermissions,   // Demander la permission
    sendLocalNotification, // Envoyer une notification locale
    testNotification,     // Tester rapidement
  } = useCapacitorNotifications();

  // Demander la permission au montage
  useEffect(() => {
    if (isNative && !hasPermission) {
      requestPermissions();
    }
  }, [isNative, hasPermission]);

  // Envoyer une notification
  const handleNotif = async () => {
    await sendLocalNotification(
      'Titre',
      'Message de la notification'
    );
  };

  return (
    <div>
      <button onClick={handleNotif}>Envoyer Notification</button>
      <button onClick={testNotification}>Test Rapide</button>
    </div>
  );
}
```

## Configuration Personnalisee

### Couleurs et Theme

Editer `capacitor.config.ts`:

```typescript
SplashScreen: {
  backgroundColor: '#FF9500', // Couleur orange Wallfin
  launchShowDuration: 2000,
},
StatusBar: {
  backgroundColor: '#FF9500', // Couleur orange Wallfin
  style: 'light',
},
```

### Icones et Splash Screen

1. **Preparer les assets**:
   - Icone: 1024x1024px (PNG avec fond transparent)
   - Splash: 2732x2732px (PNG)

2. **Placer dans**:
   - iOS: `ios/App/App/Assets.xcassets/`
   - Android: `android/app/src/main/res/`

3. **Regenerer les icones**: Utiliser un outil comme:
   ```bash
   npx @capacitor/assets generate
   ```

## Notifications Push

### Configuration iOS

1. Dans le projet iOS (Xcode):
   - Aller dans "Signing & Capabilities"
   - Ajouter "Push Notifications"
   - Ajouter "Background Modes" > cocher "Remote notifications"

2. Obtenir le certificat APNs depuis Apple Developer Console

3. Dans votre code React:
   ```typescript
   import { PushNotifications } from '@capacitor/push-notifications';

   // Demander la permission
   await PushNotifications.requestPermissions();

   // Enregistrer pour recevoir les notifications
   await PushNotifications.register();

   // Ecouter le token
   PushNotifications.addListener('registration', (token) => {
     console.log('Push token:', token.value);
   });
   ```

### Configuration Android

1. Creer un projet Firebase
2. Ajouter `google-services.json` dans `android/app/`
3. Les notifications fonctionneront automatiquement

## Debugging

### iOS

- **Logs**: Voir dans Xcode console (⌘ + Shift + Y)
- **Safari DevTools**:
  - Safari > Preferences > Advanced > Show Develop menu
  - Develop > Simulator > [Your App]

### Android

- **Logs**: Voir dans Android Studio Logcat
- **Chrome DevTools**:
  - Chrome: `chrome://inspect`
  - Cliquer sur "inspect" sous votre app

## Troubleshooting

### iOS: "No signing certificate found"

1. Dans Xcode, aller dans Preferences > Accounts
2. Ajouter votre Apple ID
3. Dans le projet, Signing & Capabilities > Team > Selectionner votre equipe

### Android: "SDK location not found"

1. Creer `android/local.properties`:
   ```
   sdk.dir=/Users/VOTRE_NOM/Library/Android/sdk
   ```

### "Build failed" apres modification

1. Nettoyer et rebuild:
   ```bash
   npm run build
   npx cap sync
   ```

2. Pour iOS, nettoyer Xcode (Product > Clean Build Folder)
3. Pour Android, nettoyer Gradle (Build > Clean Project)

## Ressources

- **Documentation Capacitor**: https://capacitorjs.com/docs
- **iOS Development**: https://developer.apple.com/documentation/
- **Android Development**: https://developer.android.com/docs
- **Capacitor Plugins**: https://capacitorjs.com/docs/plugins

## Commandes de Reference

```bash
# Verifier la configuration
npx cap doctor

# Voir les plugins installes
npx cap ls

# Mettre a jour Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/ios@latest @capacitor/android@latest

# Copier les assets web
npx cap copy

# Mettre a jour les plugins natifs
npx cap update

# Synchroniser tout
npx cap sync
```
