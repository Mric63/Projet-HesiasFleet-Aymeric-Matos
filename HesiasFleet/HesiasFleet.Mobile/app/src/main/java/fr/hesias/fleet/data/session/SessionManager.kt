package fr.hesias.fleet.data.session

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Stocke le JWT et l'utilisateur courant de façon chiffrée (EncryptedSharedPreferences).
 * Un token JWT est une donnée sensible : on ne l'écrit jamais en clair sur le disque.
 */
class SessionManager private constructor(context: Context) {

    private val prefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            "hesias_fleet_session",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var token: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    var userDisplayName: String?
        get() = prefs.getString(KEY_USER, null)
        set(value) = prefs.edit().putString(KEY_USER, value).apply()

    fun isLoggedIn(): Boolean = !token.isNullOrBlank()

    fun clear() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER = "user_display_name"

        @Volatile private var instance: SessionManager? = null

        fun getInstance(context: Context): SessionManager =
            instance ?: synchronized(this) {
                instance ?: SessionManager(context.applicationContext).also { instance = it }
            }
    }
}
