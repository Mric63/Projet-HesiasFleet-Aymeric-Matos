package fr.hesias.fleet.data.api

import android.content.Context
import fr.hesias.fleet.BuildConfig
import fr.hesias.fleet.data.session.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/** Fabrique unique du client Retrofit, partagée par toute l'application. */
object ApiClient {

    @Volatile private var api: FleetApi? = null

    fun get(context: Context): FleetApi =
        api ?: synchronized(this) {
            api ?: build(context.applicationContext).also { api = it }
        }

    private fun build(context: Context): FleetApi {
        val session = SessionManager.getInstance(context)

        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                    else HttpLoggingInterceptor.Level.NONE
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(session))
            .addInterceptor(logging)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FleetApi::class.java)
    }
}
