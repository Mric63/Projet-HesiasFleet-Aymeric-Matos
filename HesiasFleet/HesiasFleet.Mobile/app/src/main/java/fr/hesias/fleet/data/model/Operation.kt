package fr.hesias.fleet.data.model

/** OperationConsumableDto : un consommable du magasin + quantité */
data class OperationConsumable(
    val partId: Int,
    val quantity: Int
)

/** OperationSparePartDto : pièce libre saisie au vol, sans lien avec le stock */
data class OperationSparePart(
    val label: String,
    val unitCost: Double? = null
)

/** OperationDto renvoyé par l'API */
data class Operation(
    val id: Int,
    val vehicleId: Int,
    val date: String,            // ISO 8601 (ex : 2026-08-23T00:00:00.000Z)
    val mileage: Int,
    val label: String,
    val deadlineDate: String? = null,
    val deadlineMileage: Int? = null,
    val consumables: List<OperationConsumable> = emptyList(),
    val spareParts: List<OperationSparePart> = emptyList()
)

/** CreateOperationDto envoyé pour créer une opération */
data class CreateOperation(
    val vehicleId: Int,
    val date: String,
    val mileage: Int,
    val label: String,
    val deadlineDate: String? = null,
    val deadlineMileage: Int? = null,
    val consumables: List<OperationConsumable> = emptyList(),
    val spareParts: List<OperationSparePart> = emptyList()
)
