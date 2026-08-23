package fr.hesias.fleet.ui.operation

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import fr.hesias.fleet.databinding.ActivityOperationFormBinding
import fr.hesias.fleet.databinding.ItemChildOperationBinding
import fr.hesias.fleet.databinding.ItemSparePartBinding
import fr.hesias.fleet.util.DateUtils
import java.util.Calendar
import java.util.Date

/**
 * Écran de saisie d'une opération OU d'une méta-opération pour un véhicule.
 *
 * Assistance à la saisie (exigence §2.1.4) : la date et le kilométrage sont
 * pré-remplis avec les valeurs de la dernière opération (transmises par
 * l'écran de détail), pour que le technicien n'ait pas à les re-saisir.
 */
class OperationFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOperationFormBinding
    private val viewModel: OperationFormViewModel by viewModels()

    private var vehicleId: Int = 0
    private var selectedDate: Date = Date()
    private var selectedDeadlineDate: Date? = null

    companion object {
        const val EXTRA_VEHICLE_ID = "vehicle_id"
        const val EXTRA_VEHICLE_LABEL = "vehicle_label"
        const val EXTRA_DEFAULT_MILEAGE = "default_mileage"
        const val EXTRA_DEFAULT_DATE_ISO = "default_date_iso"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOperationFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        vehicleId = intent.getIntExtra(EXTRA_VEHICLE_ID, 0)
        val vehicleLabel = intent.getStringExtra(EXTRA_VEHICLE_LABEL) ?: "Véhicule"
        val defaultMileage = intent.getIntExtra(EXTRA_DEFAULT_MILEAGE, 0)
        val defaultDateIso = intent.getStringExtra(EXTRA_DEFAULT_DATE_ISO)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Saisir une opération"
        supportActionBar?.subtitle = vehicleLabel
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // --- Assistance à la saisie : pré-remplissage date + km ---
        selectedDate = DateUtils.parseIso(defaultDateIso) ?: Date()
        binding.textDate.text = DateUtils.toDisplay(selectedDate)
        binding.editMileage.setText(defaultMileage.toString())

        // Sélecteur de date de l'opération
        binding.textDate.setOnClickListener { pickOperationDate() }

        // Bascule opération simple / méta-opération
        binding.switchMeta.setOnCheckedChangeListener { _, isMeta ->
            binding.metaSection.visibility = if (isMeta) View.VISIBLE else View.GONE
            binding.sparePartsSection.visibility = if (isMeta) View.GONE else View.VISIBLE
            supportActionBar?.title =
                if (isMeta) "Saisir une méta-opération" else "Saisir une opération"
        }

        // Butée optionnelle
        binding.switchDeadline.setOnCheckedChangeListener { _, checked ->
            binding.deadlineSection.visibility = if (checked) View.VISIBLE else View.GONE
        }
        binding.textDeadlineDate.setOnClickListener { pickDeadlineDate() }

        // Ajout dynamique de pièces libres et d'opérations composantes
        binding.buttonAddSparePart.setOnClickListener { addSparePartRow() }
        binding.buttonAddChild.setOnClickListener { addChildRow() }

        binding.buttonSave.setOnClickListener { save() }

        viewModel.state.observe(this) { state ->
            when (state) {
                is SaveState.Saving -> setLoading(true)
                is SaveState.Success -> {
                    Toast.makeText(this, "Enregistré.", Toast.LENGTH_SHORT).show()
                    setResult(RESULT_OK)
                    finish()
                }
                is SaveState.Error -> {
                    setLoading(false)
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
                is SaveState.Idle -> setLoading(false)
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    private fun setLoading(loading: Boolean) {
        binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        binding.buttonSave.isEnabled = !loading
    }

    private fun pickOperationDate() {
        val cal = Calendar.getInstance().apply { time = selectedDate }
        DatePickerDialog(
            this,
            { _, y, m, d ->
                cal.set(y, m, d)
                selectedDate = cal.time
                binding.textDate.text = DateUtils.toDisplay(selectedDate)
            },
            cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun pickDeadlineDate() {
        val cal = Calendar.getInstance().apply { time = selectedDeadlineDate ?: Date() }
        DatePickerDialog(
            this,
            { _, y, m, d ->
                cal.set(y, m, d)
                selectedDeadlineDate = cal.time
                binding.textDeadlineDate.text = DateUtils.toDisplay(cal.time)
            },
            cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun addSparePartRow() {
        val row = ItemSparePartBinding.inflate(layoutInflater, binding.sparePartsContainer, false)
        row.buttonRemove.setOnClickListener { binding.sparePartsContainer.removeView(row.root) }
        binding.sparePartsContainer.addView(row.root)
    }

    private fun addChildRow() {
        val row = ItemChildOperationBinding.inflate(layoutInflater, binding.childrenContainer, false)
        row.buttonRemove.setOnClickListener { binding.childrenContainer.removeView(row.root) }
        binding.childrenContainer.addView(row.root)
    }

    private fun collectSpareParts(): List<Pair<String, Double?>> {
        val result = mutableListOf<Pair<String, Double?>>()
        for (i in 0 until binding.sparePartsContainer.childCount) {
            val row = ItemSparePartBinding.bind(binding.sparePartsContainer.getChildAt(i))
            val label = row.editLabel.text?.toString()?.trim().orEmpty()
            if (label.isEmpty()) continue
            val cost = row.editCost.text?.toString()?.toDoubleOrNull()
            result += label to cost
        }
        return result
    }

    private fun collectChildren(): List<String> {
        val result = mutableListOf<String>()
        for (i in 0 until binding.childrenContainer.childCount) {
            val row = ItemChildOperationBinding.bind(binding.childrenContainer.getChildAt(i))
            val label = row.editLabel.text?.toString()?.trim().orEmpty()
            if (label.isNotEmpty()) result += label
        }
        return result
    }

    private fun save() {
        val mileage = binding.editMileage.text?.toString()?.toIntOrNull()
        if (mileage == null) {
            Toast.makeText(this, "Kilométrage invalide.", Toast.LENGTH_SHORT).show()
            return
        }
        val label = binding.editLabel.text?.toString().orEmpty()

        val deadlineDate = if (binding.switchDeadline.isChecked) selectedDeadlineDate else null
        val deadlineMileage = if (binding.switchDeadline.isChecked)
            binding.editDeadlineMileage.text?.toString()?.toIntOrNull() else null

        if (binding.switchMeta.isChecked) {
            viewModel.saveMeta(
                vehicleId = vehicleId,
                date = selectedDate,
                mileage = mileage,
                label = label,
                deadlineDate = deadlineDate,
                deadlineMileage = deadlineMileage,
                childLabels = collectChildren()
            )
        } else {
            viewModel.saveOperation(
                vehicleId = vehicleId,
                date = selectedDate,
                mileage = mileage,
                label = label,
                deadlineDate = deadlineDate,
                deadlineMileage = deadlineMileage,
                spareParts = collectSpareParts()
            )
        }
    }
}
