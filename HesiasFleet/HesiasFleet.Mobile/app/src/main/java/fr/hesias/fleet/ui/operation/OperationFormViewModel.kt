package fr.hesias.fleet.ui.operation

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import fr.hesias.fleet.data.api.ApiClient
import fr.hesias.fleet.data.model.CreateMetaOperation
import fr.hesias.fleet.data.model.CreateOperation
import fr.hesias.fleet.util.DateUtils
import kotlinx.coroutines.launch
import java.io.IOException
import java.util.Date

sealed interface SaveState {
    data object Idle : SaveState
    data object Saving : SaveState
    data object Success : SaveState
    data class Error(val message: String) : SaveState
}

class OperationFormViewModel(app: Application) : AndroidViewModel(app) {

    private val api = ApiClient.get(app)

    private val _state = MutableLiveData<SaveState>(SaveState.Idle)
    val state: LiveData<SaveState> = _state

    /** Enregistre une opération simple. */
    fun saveOperation(
        vehicleId: Int,
        date: Date,
        mileage: Int,
        label: String,
        deadlineDate: Date?,
        deadlineMileage: Int?,
        spareParts: List<Pair<String, Double?>>
    ) {
        if (label.isBlank()) {
            _state.value = SaveState.Error("Le libellé est obligatoire.")
            return
        }
        _state.value = SaveState.Saving
        viewModelScope.launch {
            try {
                api.createOperation(
                    CreateOperation(
                        vehicleId = vehicleId,
                        date = DateUtils.toIso(date),
                        mileage = mileage,
                        label = label.trim(),
                        deadlineDate = deadlineDate?.let { DateUtils.toIso(it) },
                        deadlineMileage = deadlineMileage,
                        // Les consommables (liés au magasin) se gèrent côté web ;
                        // sur mobile on saisit uniquement des pièces libres au vol.
                        consumables = emptyList(),
                        spareParts = spareParts.map {
                            fr.hesias.fleet.data.model.OperationSparePart(it.first.trim(), it.second)
                        }
                    )
                )
                _state.value = SaveState.Success
            } catch (e: IOException) {
                _state.value = SaveState.Error("Impossible de joindre le serveur.")
            } catch (e: Exception) {
                _state.value = SaveState.Error("Échec de l'enregistrement.")
            }
        }
    }

    /** Enregistre une méta-opération : un libellé + plusieurs opérations composantes. */
    fun saveMeta(
        vehicleId: Int,
        date: Date,
        mileage: Int,
        label: String,
        deadlineDate: Date?,
        deadlineMileage: Int?,
        childLabels: List<String>
    ) {
        if (label.isBlank()) {
            _state.value = SaveState.Error("Le libellé de la méta-opération est obligatoire.")
            return
        }
        val children = childLabels.map { it.trim() }.filter { it.isNotEmpty() }
        if (children.isEmpty()) {
            _state.value = SaveState.Error("Ajoutez au moins une opération composante.")
            return
        }
        _state.value = SaveState.Saving
        viewModelScope.launch {
            try {
                val iso = DateUtils.toIso(date)
                api.createMetaOperation(
                    CreateMetaOperation(
                        vehicleId = vehicleId,
                        date = iso,
                        mileage = mileage,
                        label = label.trim(),
                        // La butée est portée par la méta, pas par ses composantes
                        deadlineDate = deadlineDate?.let { DateUtils.toIso(it) },
                        deadlineMileage = deadlineMileage,
                        operations = children.map { childLabel ->
                            CreateOperation(
                                vehicleId = vehicleId,
                                date = iso,
                                mileage = mileage,
                                label = childLabel,
                                deadlineDate = null,
                                deadlineMileage = null,
                                consumables = emptyList(),
                                spareParts = emptyList()
                            )
                        }
                    )
                )
                _state.value = SaveState.Success
            } catch (e: IOException) {
                _state.value = SaveState.Error("Impossible de joindre le serveur.")
            } catch (e: Exception) {
                _state.value = SaveState.Error("Échec de l'enregistrement.")
            }
        }
    }
}
