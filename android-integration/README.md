# rzlab — SDK de integración Android (Bloque 4)

Componentes Kotlin que cada APK del laboratorio Simbiosis debe incluir para
participar en el sistema de tokens con ciclo de vida.

## Componentes

| Archivo | Función |
|---|---|
| `TokenStorage.kt` | Guarda el build token en `EncryptedSharedPreferences` (nunca texto plano) |
| `StartupValidator.kt` | Heartbeat a `/api/v1/build/validate` en cada arranque. El **primer** heartbeat activa el token y arranca el reloj de 30 días. Periodo de gracia offline: 48h |
| `ExpiryScreens.kt` | `ExpiryBlockScreen` (bloqueo al expirar) y `ExpiryWarningBanner` (aviso ≤5 días), en Jetpack Compose con la estética terminal de RZStudio |
| `FeedbackTrigger.kt` | Botón Fantasma RZS: shake-to-report para enviar feedback al webhook |

## Integración mínima

```kotlin
// Application.kt
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // 1. Deep link rzstudio.dev/activate?t={token} guarda el token (primera vez)
        // 2. Validar en cada arranque:
        lifecycleScope.launch {
            when (val r = StartupValidator(this@App, "https://rzstudio.dev").validate()) {
                is ValidationResult.Blocked  -> navigateTo(ExpiryBlockScreen(r.message))
                is ValidationResult.Warning  -> showBanner(r.daysRemaining)
                is ValidationResult.NoToken  -> navigateTo(ActivationScreen())
                is ValidationResult.Ok       -> Unit // arranque normal
            }
        }
    }
}
```

## AndroidManifest.xml — deep link de activación

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="rzstudio.dev" android:pathPrefix="/activate" />
</intent-filter>
```

## Dependencias

```kotlin
implementation("androidx.security:security-crypto:1.1.0-alpha06")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
```

## Ciclo de vida del token (servidor)

```
registro web → token "pending" + enlace de descarga (TTL 24h)
            → instalación → primer arranque → heartbeat → "active" (reloj 30 días)
            → cron del servidor: aviso a 5 días, seguimiento 48h, bloqueo al expirar
            → admin puede revocar / extender (máx. 2 renovaciones)
```
