package fr.hesias.fleet.ui.vehicles

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import fr.hesias.fleet.data.api.ApiClient
import fr.hesias.fleet.data.model.Vehicle
import fr.hesias.fleet.data.session.SessionManager
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

sealed interface VehiclesState {
    data object Loading : VehiclesState
    data class Loaded(val vehicles: List<Vehicle>) : VehiclesState
    data class Error(val message: String) : VehiclesState
    data object Unauthorized : VehiclesState
}

class VehicleListViewModel(app: Application) : AndroidViewModel(app) {

    private val api = ApiClient.get(app)
    private val session = SessionManager.getInstance(app)

    private var all: List<Vehicle> = emptyList()

    private val _state = MutableLiveData<VehiclesState>(VehiclesState.Loading)
    val state: LiveData<VehiclesState> = _state

    fun userName(): String = session.userDisplayName ?: "Technicien"

    fun load() {
        _state.value = VehiclesState.Loading
        viewModelScope.launch {
            try {
                all = api.getVehicles()
                _state.value = VehiclesState.Loaded(all)
            } catch (e: HttpException) {
                if (e.code() == 401) {
                    session.clear()
                    _state.value = VehiclesState.Unauthorized
                } else {
                    _state.value = VehiclesState.Error("Erreur serveur (${e.code()}).")
                }
            } catch (e: IOException) {
                _state.value = VehiclesState.Error("Impossible de joindre le serveur.")
            }
        }
    }

    /** Filtre local sur marque, modèle et identifiants (comme le front web). */
    fun filter(query: String) {
        val q = query.trim().lowercase()
        val filtered = if (q.isEmpty()) all else all.filter { v ->
            listOfNotNull(v.brand, v.model, v.registrationNew, v.registrationOld, v.customIdentifier)
                .any { it.lowercase().contains(q) }
        }
        _state.value = VehiclesState.Loaded(filtered)
    }

    /**
     * Résout un texte scanné (QR) vers un véhicule.
     * Le QR peut contenir l'id numérique ou une immatriculation/identifiant.
     */
    fun findByScan(raw: String): Vehicle? {
        val code = raw.trim()
        code.toIntOrNull()?.let { id -> all.firstOrNull { it.id == id }?.let { return it } }
        return all.firstOrNull { v ->
            listOfNotNull(v.registrationNew, v.registrationOld, v.customIdentifier)
                .any { it.equals(code, ignoreCase = true) }
        }
    }

    fun logout() = session.clear()
}
