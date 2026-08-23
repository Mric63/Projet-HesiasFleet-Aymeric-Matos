package fr.hesias.fleet.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Conversion de dates entre l'app et l'API.
 * L'API .NET sérialise/désérialise du ISO 8601. Le front web envoie
 * `date.toISOString()` (UTC, suffixe Z) : on fait exactement pareil ici
 * pour rester cohérent entre les deux clients.
 */
object DateUtils {

    // Format d'envoi vers l'API : UTC, ex "2026-08-23T00:00:00.000Z"
    private val iso8601Utc = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    // Format d'affichage à l'utilisateur : ex "23/08/2026"
    private val displayFr = SimpleDateFormat("dd/MM/yyyy", Locale.FRANCE)

    /** Date -> chaîne ISO à envoyer à l'API */
    fun toIso(date: Date): String = iso8601Utc.format(date)

    /** Date -> "JJ/MM/AAAA" pour l'affichage */
    fun toDisplay(date: Date): String = displayFr.format(date)

    /**
     * Chaîne ISO renvoyée par l'API -> Date.
     * Tolère les variantes (.NET peut renvoyer avec ou sans millisecondes,
     * avec offset ou Z). On tente plusieurs patterns.
     */
    fun parseIso(raw: String?): Date? {
        if (raw.isNullOrBlank()) return null
        val patterns = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSS",
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd"
        )
        for (p in patterns) {
            try {
                val sdf = SimpleDateFormat(p, Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                return sdf.parse(raw)
            } catch (_: Exception) { /* essai suivant */ }
        }
        return null
    }

    /** Chaîne ISO -> "JJ/MM/AAAA" pour l'affichage, ou "—" si illisible */
    fun isoToDisplay(raw: String?): String {
        val d = parseIso(raw) ?: return "—"
        return displayFr.format(d)
    }
}
