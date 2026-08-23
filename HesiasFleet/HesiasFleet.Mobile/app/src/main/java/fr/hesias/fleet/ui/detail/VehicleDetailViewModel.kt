package fr.hesias.fleet.ui.detail

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import fr.hesias.fleet.data.api.ApiClient
import fr.hesias.fleet.data.model.Operation
import fr.hesias.fleet.util.DateUtils
import kotlinx.coroutines.launch
import java.io.IOException

sealed interface JournalState {
    data object Loading : JournalState
    data class Loaded(val entries: List<JournalEntry>) : JournalState
    data class Error(val message: String) : JournalState
}

class VehicleDetailViewModel(app: Application) : AndroidViewModel(app) {

    private val api = ApiClient.get(app)

    private val _state = MutableLiveData<JournalState>(JournalState.Loading)
    val state: LiveData<JournalState> = _state

    // Dernière opération (la plus récente), pour l'assistance à la saisie
    private var lastOperation: Operation? = null
    private var vehicleMileage: Int = 0

    fun setVehicleMileage(mileage: Int) { vehicleMileage = mileage }

    /**
     * Valeurs par défaut pour une nouvelle saisie (assistance à la saisie) :
     * on reprend le km et la date de la dernière opération connue ; à défaut,
     * le km du véhicule et la date du jour.
     */
    fun defaultMileage(): Int = lastOperation?.mileage ?: vehicleMileage
    fun defaultDateIso(): String? = lastOperation?.date

    fun load(vehicleId: Int) {
        _state.value = JournalState.Loading
        viewModelScope.launch {
            try {
                val operations = api.getOperationsByVehicle(vehicleId)
                val metas = api.getMetaOperationsByVehicle(vehicleId)
                val notes = api.getNotesByVehicle(vehicleId)

                // Les opérations composantes d'une méta ne sont pas répétées
                val metaChildIds = metas.flatMap { m -> m.operations.map { it.id } }.toSet()

                val entries = buildList {
                    operations.filter { it.id !in metaChildIds }
                        .forEach { add(JournalEntry.OperationEntry(it)) }
                    metas.forEach { add(JournalEntry.MetaEntry(it)) }
                    notes.forEach { add(JournalEntry.NoteEntry(it)) }
                }.sortedByDescending { DateUtils.parseIso(it.dateIso)?.time ?: 0L }

                // Mémorise la dernière opération (toutes opérations confondues) pour l'assistance
                lastOperation = operations.maxByOrNull { DateUtils.parseIso(it.date)?.time ?: 0L }

                _state.value = JournalState.Loaded(entries)
            } catch (e: IOException) {
                _state.value = JournalState.Error("Impossible de joindre le serveur.")
            } catch (e: Exception) {
                _state.value = JournalState.Error("Erreur lors du chargement du journal.")
            }
        }
    }
}
