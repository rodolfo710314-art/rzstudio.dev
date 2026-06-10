package dev.rzstudio.rzlab

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Almacenamiento seguro del build token (doc Bloque 4).
 * Usa EncryptedSharedPreferences — el token nunca se guarda en texto plano.
 *
 * Dependencia: androidx.security:security-crypto:1.1.0-alpha06
 */
class TokenStorage(context: Context) {

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "rzlab_secure",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    var buildToken: String?
        get() = prefs.getString("build_token", null)
        set(value) = prefs.edit().putString("build_token", value).apply()

    /** Último heartbeat exitoso (epoch ms) — base del periodo de gracia offline. */
    var lastValidationMs: Long
        get() = prefs.getLong("last_validation_ms", 0L)
        set(value) = prefs.edit().putLong("last_validation_ms", value).apply()

    var daysRemaining: Int
        get() = prefs.getInt("days_remaining", -1)
        set(value) = prefs.edit().putInt("days_remaining", value).apply()

    fun clear() = prefs.edit().clear().apply()
}
