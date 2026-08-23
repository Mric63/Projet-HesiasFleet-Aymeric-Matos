package fr.hesias.fleet.data.api

import fr.hesias.fleet.data.session.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Ajoute l'en-tête Authorization: Bearer <token> sur chaque requête,
 * sauf sur /auth/login qui n'exige pas de token.
 * Équivalent Android de l'authInterceptor Angular.
 */
class AuthInterceptor(private val session: SessionManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = session.token

        val request = if (token.isNullOrBlank() || original.url.encodedPath.endsWith("/auth/login")) {
            original
        } else {
            original.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        }
        return chain.proceed(request)
    }
}
