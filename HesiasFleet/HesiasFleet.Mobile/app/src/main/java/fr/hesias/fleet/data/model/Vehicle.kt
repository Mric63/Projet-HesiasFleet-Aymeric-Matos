package fr.hesias.fleet.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/** VehicleDto côté API. Nullable là où l'API tolère l'absence. */
@Parcelize
data class Vehicle(
    val id: Int,
    val registrationOld: String?,
    val registrationNew: String?,
    val customIdentifier: String?,
    val brand: String,
    val model: String,
    val mileage: Int,
    val properties: List<VehicleProperty> = emptyList()
) : Parcelable {

    /** Identifiant lisible, même logique que VehicleService.label côté Angular. */
    fun displayIdentifier(): String =
        registrationNew ?: registrationOld ?: customIdentifier ?: "—"

    fun label(): String {
        val base = "$brand $model".trim()
        val id = registrationNew ?: registrationOld ?: customIdentifier
        return if (id != null) "$base ($id)" else base
    }
}

@Parcelize
data class VehicleProperty(
    val key: String,
    val value: String
) : Parcelable
