# Guide de Build et Publication - Wallfin Native App

Ce guide explique comment builder et publier votre application Wallfin sur Google Play Store et Apple App Store.

## Configuration Complète

### App ID et Informations
- **App ID**: `com.wallfin.client`
- **App Name**: Wallfin
- **Version**: 1.0.0
- **Theme Color**: #FF9500 (Orange)

## Prérequis

### Pour Android
- **Node.js** 16+ et npm
- **Android Studio** (dernière version stable)
- **JDK** 11 ou 17
- **Gradle** (inclus avec Android Studio)
- **Compte Google Play Developer** (99$ une fois)

### Pour iOS
- **macOS** (obligatoire pour iOS)
- **Xcode** 14+ (gratuit sur Mac App Store)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Apple Developer Account** (99$/an)

## Installation Initiale

### 1. Installer les dépendances
```bash
npm install
```

### 2. Build l'application web
```bash
npm run build
```

### 3. Sync avec Capacitor
```bash
npx cap sync
```

Cette commande :
- Copie le dossier `dist/` vers Android et iOS
- Met à jour les plugins Capacitor
- Configure les permissions natives

## Build Android

### 1. Ouvrir le projet Android
```bash
npm run android:dev
# ou
npx cap open android
```

### 2. Configuration dans Android Studio

#### a) Changer le Package Name (si nécessaire)
1. Ouvrir `android/app/build.gradle`
2. Vérifier : `applicationId "com.wallfin.client"`
3. Vérifier : `namespace = "com.wallfin.client"`

#### b) Configurer le Signing Key (pour release)

Générer un keystore :
```bash
cd android/app
keytool -genkey -v -keystore wallfin-release.keystore -alias wallfin -keyalg RSA -keysize 2048 -validity 10000
```

Créer `android/key.properties` :
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=wallfin
storeFile=wallfin-release.keystore
```

Ajouter dans `android/app/build.gradle` (dans `android {}`) :
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...existing config...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build APK (Debug)
```bash
cd android
./gradlew assembleDebug
```

APK généré : `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Build AAB (Release - pour Play Store)
```bash
cd android
./gradlew bundleRelease
```

AAB généré : `android/app/build/outputs/bundle/release/app-release.aab`

### 5. Tester l'APK sur un appareil
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 6. Configuration Push Notifications Android (Firebase)

#### Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet "Wallfin"
3. Ajouter une application Android
4. Package name : `com.wallfin.client`

#### Télécharger google-services.json
1. Dans Firebase Console > Project Settings
2. Télécharger `google-services.json`
3. Placer dans `android/app/google-services.json`

#### Activer FCM
1. Firebase Console > Cloud Messaging
2. Activer "Firebase Cloud Messaging API"
3. Noter la "Server Key" pour votre backend

### 7. Publication sur Google Play Store

#### Préparer les assets
- **Icône** : 512x512px PNG
- **Feature Graphic** : 1024x500px
- **Screenshots** :
  - 2-8 screenshots par appareil
  - Portrait : 1080x1920px minimum
  - Landscape : 1920x1080px minimum
- **Description courte** : 80 caractères max
- **Description complète** : 4000 caractères max

#### Créer une nouvelle app
1. [Google Play Console](https://play.google.com/console)
2. Créer une application
3. Remplir le formulaire

#### Upload l'AAB
1. Production > Créer une version
2. Upload `app-release.aab`
3. Remplir les informations de version
4. Soumettre pour révision

## Build iOS

### 1. Ouvrir le projet iOS
```bash
npm run ios:dev
# ou
npx cap open ios
```

### 2. Configuration dans Xcode

#### a) Bundle Identifier
1. Sélectionner le projet "App" dans le navigateur
2. Onglet "Signing & Capabilities"
3. Bundle Identifier : `com.wallfin.client`

#### b) Signing
1. Team : Sélectionner votre Apple Developer Team
2. Cocher "Automatically manage signing"

#### c) Capabilities
1. Cliquer sur "+ Capability"
2. Ajouter "Push Notifications"
3. Ajouter "Background Modes" > cocher "Remote notifications"

### 3. Configuration Push Notifications iOS (APNs)

#### Créer un APNs Key
1. [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Créer une nouvelle Key
3. Activer "Apple Push Notifications service (APNs)"
4. Télécharger le fichier `.p8`
5. Noter le Key ID et Team ID

#### Configurer dans Firebase (optionnel)
1. Firebase Console > Project Settings
2. Cloud Messaging > iOS app
3. Upload le fichier APNs `.p8`
4. Entrer Key ID et Team ID

### 4. Build pour Test (Simulator)
```bash
# Dans Xcode
Cmd + R (Run)
```

### 5. Build pour Test (Device)
1. Connecter un iPhone/iPad
2. Sélectionner l'appareil dans Xcode
3. Cmd + R (Run)

### 6. Build pour Distribution (App Store)

#### a) Archive
1. Xcode > Product > Archive
2. Attendre la fin du build
3. L'Organizer s'ouvre automatiquement

#### b) Valider l'archive
1. Sélectionner l'archive
2. Cliquer "Validate App"
3. Sélectionner les options de signing
4. Attendre la validation

#### c) Upload vers App Store Connect
1. Cliquer "Distribute App"
2. Sélectionner "App Store Connect"
3. Upload
4. Attendre le traitement (peut prendre 10-30 min)

### 7. Publication sur Apple App Store

#### Préparer les assets
- **Icône** : 1024x1024px PNG (sans transparence)
- **Screenshots** :
  - iPhone 6.7" (iPhone 14 Pro Max) : 1290x2796px
  - iPhone 6.5" (iPhone 11 Pro Max) : 1242x2688px
  - iPad Pro 12.9" (optionnel) : 2048x2732px
- **Preview Video** (optionnel) : 15-30 secondes

#### Créer l'app sur App Store Connect
1. [App Store Connect](https://appstoreconnect.apple.com/)
2. My Apps > +
3. New App
4. Bundle ID : `com.wallfin.client`
5. Remplir les informations

#### Soumettre pour révision
1. Sélectionner le build uploadé
2. Ajouter screenshots et description
3. Remplir les informations de confidentialité
4. Soumettre pour révision
5. Attendre l'approbation (1-3 jours généralement)

## Commandes Utiles

### Workflow complet
```bash
# 1. Développer et tester
npm run dev

# 2. Build web
npm run build

# 3. Sync avec Capacitor
npx cap sync

# 4. Ouvrir Android Studio
npx cap open android

# 5. Ouvrir Xcode
npx cap open ios
```

### Update après modifications web
```bash
npm run build
npx cap sync
```

### Update avec nouvelles dépendances Capacitor
```bash
npm install
npx cap sync
```

### Clean build (si problèmes)
```bash
# Android
cd android
./gradlew clean

# iOS
cd ios/App
rm -rf Pods
pod install
```

### Logs en temps réel
```bash
# Android
npx cap run android -l

# iOS
npx cap run ios -l
```

## Utiliser les Notifications dans le Code

### Import du hook
```typescript
import { useCapacitorNotifications } from './hooks/useCapacitorNotifications';
```

### Exemple d'utilisation
```typescript
function MonComposant() {
  const {
    isNative,
    hasPermission,
    pushToken,
    requestPermissions,
    sendLocalNotification,
    testNotification,
  } = useCapacitorNotifications();

  useEffect(() => {
    if (isNative && !hasPermission) {
      requestPermissions();
    }
  }, [isNative, hasPermission]);

  const handleTest = async () => {
    await testNotification();
  };

  return (
    <div>
      <p>Platform: {isNative ? 'Native' : 'Web'}</p>
      <p>Permission: {hasPermission ? 'Granted' : 'Not granted'}</p>
      <p>Push Token: {pushToken || 'N/A'}</p>
      <button onClick={handleTest}>Test Notification</button>
    </div>
  );
}
```

### Envoyer une notification personnalisée
```typescript
await sendLocalNotification(
  'Nouveau crédit approuvé',
  'Votre demande de crédit a été approuvée!'
);
```

### Programmer une notification
```typescript
const date = new Date();
date.setHours(date.getHours() + 1); // Dans 1 heure

await scheduleNotification(
  'Rappel',
  'N\'oubliez pas de vérifier votre crédit',
  date
);
```

## Troubleshooting

### Android

#### Erreur "SDK not found"
```bash
# Définir ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Erreur de build Gradle
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

#### App crash au démarrage
- Vérifier les logs : `adb logcat`
- Vérifier que `google-services.json` est présent
- Nettoyer et rebuild

### iOS

#### Erreur "No signing certificate"
1. Xcode > Preferences > Accounts
2. Ajouter votre Apple ID
3. Download Manual Profiles

#### Pods erreur
```bash
cd ios/App
pod deintegrate
pod install
```

#### Build erreur après update
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

## Support des Plateformes

| Feature                    | Android | iOS | Web |
|---------------------------|---------|-----|-----|
| Push Notifications        | ✅      | ✅  | ⚠️  |
| Local Notifications       | ✅      | ✅  | ✅  |
| Haptic Feedback          | ✅      | ✅  | ❌  |
| Splash Screen            | ✅      | ✅  | ❌  |
| Status Bar Control       | ✅      | ✅  | ❌  |
| Keyboard Management      | ✅      | ✅  | N/A |
| Offline Mode             | ✅      | ✅  | ✅  |

✅ Support complet | ⚠️ Support limité | ❌ Non supporté

## Ressources

### Documentation
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/documentation/)

### Stores
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

### Push Notifications
- [Firebase Console](https://console.firebase.google.com/)
- [Apple Push Notifications](https://developer.apple.com/notifications/)

### Outils
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)

## Checklist Pré-Publication

### Android
- [ ] `applicationId` correct dans `build.gradle`
- [ ] `versionCode` et `versionName` mis à jour
- [ ] Keystore configuré pour release
- [ ] `google-services.json` présent
- [ ] Permissions correctes dans `AndroidManifest.xml`
- [ ] App testée sur plusieurs appareils
- [ ] Screenshots et assets préparés
- [ ] Description et métadonnées complétées

### iOS
- [ ] Bundle Identifier correct
- [ ] Version et Build number mis à jour
- [ ] Signing configuré
- [ ] APNs Key configuré
- [ ] Capabilities ajoutées (Push, Background)
- [ ] App testée sur iPhone et iPad
- [ ] Screenshots et assets préparés
- [ ] Privacy Policy URL ajoutée
- [ ] Description et métadonnées complétées

## Notes Importantes

### Sécurité
- JAMAIS commit `key.properties` ou `wallfin-release.keystore`
- JAMAIS commit `google-services.json` avec vraies clés de prod
- Ajouter dans `.gitignore` :
  ```
  android/key.properties
  android/app/*.keystore
  android/app/google-services.json
  ios/App/GoogleService-Info.plist
  ```

### Versions
- Incrémenter `versionCode` (Android) à chaque upload
- Incrémenter `versionName` selon semantic versioning
- iOS : Incrémenter "Build" pour chaque upload

### Tests
- Tester sur appareils réels (pas seulement simulateurs)
- Tester les notifications push en production
- Tester le mode offline
- Tester sur différentes versions OS

## Contact & Support

Pour toute question sur le build ou la publication, consultez :
- Documentation Capacitor officielle
- Stack Overflow avec tag `capacitor`
- Discord Ionic/Capacitor communauté
