package fr.hesias.fleet.data.model

/** MetaOperationDto renvoyé par l'API */
data class MetaOperation(
    val id: Int,
    val vehicleId: Int,
    val date: String,
    val mileage: Int,
    val label: String,
    val deadlineDate: String? = null,
    val deadlineMileage: Int? = null,
    val operations: List<Operation> = emptyList()
)

/** CreateMetaOperationDto : la méta + ses opérations composantes */
data class CreateMetaOperation(
    val vehicleId: Int,
    val date: String,
    val mileage: Int,
    val label: String,
    val deadlineDate: String? = null,
    val deadlineMileage: Int? = null,
    val operations: List<CreateOperation> = emptyList()
)
