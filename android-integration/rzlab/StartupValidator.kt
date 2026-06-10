package dev.rzstudio.rzlab

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Validador de arranque (doc Bloque 4) — llama /api/v1/build/validate en cada
 * Application.onCreate(). El PRIMER heartbeat activa el token y arranca el
 * reloj de 30 días en el servidor.
 *
 * Periodo de gracia offline: si no hay red, la app sigue funcionando hasta
 * GRACE_HOURS desde la última validación exitosa.
 *
 * Uso en Application.onCreate():
 *   val result = StartupValidator(this, BuildConfig.RZ_BASE_URL).validate()
 *   when (result) {
 *     is ValidationResult.Blocked -> mostrar ExpiryBlockScreen(result.message)
 *     is ValidationResult.Warning -> mostrar ExpiryWarningToast(result.daysRemaining)
 *     else -> continuar arranque normal
 *   }
 */
class StartupValidator(
    context: Context,
    private val baseUrl: String, // ej. "https://rzstudio.dev"
) {
    private val storage = TokenStorage(context)

    companion object {
        const val GRACE_HOURS = 48
    }

    sealed class ValidationResult {
        data class Ok(val daysRemaining: Int) : ValidationResult()
        data class Warning(val daysRemaining: Int, val message: String) : ValidationResult()
        data class Blocked(val message: String) : ValidationResult()
        object NoToken : ValidationResult()
    }

    suspend fun validate(): ValidationResult = withContext(Dispatchers.IO) {
        val token = storage.buildToken ?: return@withContext ValidationResult.NoToken

        try {
            val url = URL("$baseUrl/api/v1/build/validate?t=$token")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 8000
                readTimeout = 8000
            }

            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(body)

            val ok = json.optBoolean("ok", false)
            val days = json.optInt("daysRemaining", -1)
            val warning = json.optBoolean("warningActive", false)
            val message = json.optString("message", "")

            if (!ok) {
                storage.daysRemaining = 0
                return@withContext ValidationResult.Blocked(message.ifEmpty { "acceso no válido" })
            }

            storage.lastValidationMs = System.currentTimeMillis()
            storage.daysRemaining = days

            if (warning) ValidationResult.Warning(days, "tu periodo de prueba expira en $days días")
            else ValidationResult.Ok(days)

        } catch (e: Exception) {
            // Sin red: aplicar periodo de gracia offline
            val sinceLastMs = System.currentTimeMillis() - storage.lastValidationMs
            val graceMs = GRACE_HOURS * 3_600_000L

            if (storage.lastValidationMs > 0 && sinceLastMs < graceMs) {
                ValidationResult.Ok(storage.daysRemaining)
            } else {
                ValidationResult.Blocked("sin conexión y periodo de gracia agotado — conéctate a internet para validar tu acceso")
            }
        }
    }

    /** Deep link rzstudio.dev/activate?t={token} — guarda el token en el primer arranque. */
    fun handleDeepLink(uriToken: String?) {
        if (!uriToken.isNullOrBlank()) storage.buildToken = uriToken.trim()
    }
}
