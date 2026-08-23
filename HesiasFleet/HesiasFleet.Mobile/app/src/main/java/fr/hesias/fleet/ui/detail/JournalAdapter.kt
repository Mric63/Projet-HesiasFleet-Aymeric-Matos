package fr.hesias.fleet.ui.detail

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import fr.hesias.fleet.databinding.ItemJournalBinding
import fr.hesias.fleet.util.DateUtils

/**
 * Affiche le journal fusionné. Chaque entrée indique son type (opération,
 * méta-opération, note) via une puce colorée, sa date, son km et son libellé.
 */
class JournalAdapter : ListAdapter<JournalEntry, JournalAdapter.VH>(DIFF) {

    inner class VH(private val binding: ItemJournalBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(entry: JournalEntry) {
            val meta = StringBuilder(DateUtils.isoToDisplay(entry.dateIso))
            entry.mileage?.let { meta.append("  ·  %,d km".format(it)) }
            binding.textMeta.text = meta.toString()

            when (entry) {
                is JournalEntry.OperationEntry -> {
                    binding.textKind.text = "Opération"
                    binding.textTitle.text = entry.operation.label
                    binding.textDetail.text = buildOperationDetail(entry)
                    binding.textDetail.visibility =
                        if (binding.textDetail.text.isBlank()) android.view.View.GONE
                        else android.view.View.VISIBLE
                }
                is JournalEntry.MetaEntry -> {
                    binding.textKind.text = "Méta-opération"
                    binding.textTitle.text = entry.meta.label
                    val children = entry.meta.operations.joinToString("\n") { "• ${it.label}" }
                    binding.textDetail.text = children
                    binding.textDetail.visibility =
                        if (children.isBlank()) android.view.View.GONE else android.view.View.VISIBLE
                }
                is JournalEntry.NoteEntry -> {
                    binding.textKind.text = "Note"
                    binding.textTitle.text = entry.note.content
                    binding.textDetail.visibility = android.view.View.GONE
                }
            }

            // Butée éventuelle (opération ou méta)
            val deadline = when (entry) {
                is JournalEntry.OperationEntry ->
                    formatDeadline(entry.operation.deadlineDate, entry.operation.deadlineMileage)
                is JournalEntry.MetaEntry ->
                    formatDeadline(entry.meta.deadlineDate, entry.meta.deadlineMileage)
                else -> null
            }
            binding.textDeadline.text = deadline ?: ""
            binding.textDeadline.visibility =
                if (deadline == null) android.view.View.GONE else android.view.View.VISIBLE
        }

        private fun buildOperationDetail(entry: JournalEntry.OperationEntry): String {
            val parts = mutableListOf<String>()
            val consum = entry.operation.consumables
            if (consum.isNotEmpty()) {
                parts += "Consommables : " + consum.joinToString(", ") {
                    "pièce #${it.partId} × ${it.quantity}"
                }
            }
            val spares = entry.operation.spareParts
            if (spares.isNotEmpty()) {
                parts += "Pièces libres : " + spares.joinToString(", ") { sp ->
                    if (sp.unitCost != null) "${sp.label} (${sp.unitCost} €)" else sp.label
                }
            }
            return parts.joinToString("\n")
        }

        private fun formatDeadline(dateIso: String?, mileage: Int?): String? {
            if (dateIso == null && mileage == null) return null
            val b = StringBuilder("Butée : ")
            if (dateIso != null) b.append("le ${DateUtils.isoToDisplay(dateIso)}")
            if (mileage != null) {
                if (dateIso != null) b.append(" ou ")
                b.append("à %,d km".format(mileage))
            }
            return b.toString()
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val binding = ItemJournalBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VH(binding)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(getItem(position))

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<JournalEntry>() {
            override fun areItemsTheSame(a: JournalEntry, b: JournalEntry): Boolean {
                return a::class == b::class && when {
                    a is JournalEntry.OperationEntry && b is JournalEntry.OperationEntry ->
                        a.operation.id == b.operation.id
                    a is JournalEntry.MetaEntry && b is JournalEntry.MetaEntry ->
                        a.meta.id == b.meta.id
                    a is JournalEntry.NoteEntry && b is JournalEntry.NoteEntry ->
                        a.note.id == b.note.id
                    else -> false
                }
            }
            override fun areContentsTheSame(a: JournalEntry, b: JournalEntry) = a == b
        }
    }
}
