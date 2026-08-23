package fr.hesias.fleet.data.model

/** NoteDto renvoyé par l'API */
data class Note(
    val id: Int,
    val vehicleId: Int,
    val content: String,
    val date: String,
    val mileage: Int? = null,
    val operationId: Int? = null,
    val metaOperationId: Int? = null
)
