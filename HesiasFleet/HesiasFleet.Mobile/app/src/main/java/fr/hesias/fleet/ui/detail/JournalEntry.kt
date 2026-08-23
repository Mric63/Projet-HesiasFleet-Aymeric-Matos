package fr.hesias.fleet.ui.detail

import fr.hesias.fleet.data.model.MetaOperation
import fr.hesias.fleet.data.model.Note
import fr.hesias.fleet.data.model.Operation

/**
 * Entrée unifiée du journal, à l'image du JournalEntry côté web.
 * Le journal fusionne opérations, méta-opérations et notes.
 */
sealed class JournalEntry {
    abstract val dateIso: String
    abstract val mileage: Int?

    data class OperationEntry(val operation: Operation) : JournalEntry() {
        override val dateIso get() = operation.date
        override val mileage get() = operation.mileage
    }

    data class MetaEntry(val meta: MetaOperation) : JournalEntry() {
        override val dateIso get() = meta.date
        override val mileage get() = meta.mileage
    }

    data class NoteEntry(val note: Note) : JournalEntry() {
        override val dateIso get() = note.date
        override val mileage get() = note.mileage
    }
}
