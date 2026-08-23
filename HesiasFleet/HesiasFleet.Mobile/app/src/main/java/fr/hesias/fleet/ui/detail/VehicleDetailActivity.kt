package fr.hesias.fleet.ui.detail

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import fr.hesias.fleet.data.model.Vehicle
import fr.hesias.fleet.databinding.ActivityVehicleDetailBinding
import fr.hesias.fleet.ui.operation.OperationFormActivity

/**
 * Détail d'un véhicule : affiche son journal (opérations + méta-opérations +
 * notes) et permet de lancer la saisie d'une nouvelle opération.
 */
class VehicleDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityVehicleDetailBinding
    private val viewModel: VehicleDetailViewModel by viewModels()
    private val adapter = JournalAdapter()

    private var vehicle: Vehicle? = null

    private val formLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            // Une opération vient d'être saisie : on rafraîchit le journal
            vehicle?.let { viewModel.load(it.id) }
        }
    }

    companion object {
        const val EXTRA_VEHICLE = "vehicle"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVehicleDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        @Suppress("DEPRECATION")
        vehicle = intent.getParcelableExtra(EXTRA_VEHICLE)
        val v = vehicle
        if (v == null) { finish(); return }

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = v.label()
        supportActionBar?.subtitle = "%,d km".format(v.mileage)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        viewModel.setVehicleMileage(v.mileage)

        binding.recyclerJournal.layoutManager = LinearLayoutManager(this)
        binding.recyclerJournal.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener { viewModel.load(v.id) }

        binding.fabAddOperation.setOnClickListener { openForm(v) }

        viewModel.state.observe(this) { render(it) }
        viewModel.load(v.id)
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }

    private fun render(state: JournalState) {
        binding.swipeRefresh.isRefreshing = state is JournalState.Loading
        when (state) {
            is JournalState.Loading -> { /* indicateur via swipeRefresh */ }
            is JournalState.Loaded -> {
                adapter.submitList(state.entries)
                binding.textEmpty.visibility =
                    if (state.entries.isEmpty()) View.VISIBLE else View.GONE
            }
            is JournalState.Error ->
                Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
        }
    }

    private fun openForm(v: Vehicle) {
        // Assistance à la saisie : on passe les valeurs par défaut au formulaire
        val intent = Intent(this, OperationFormActivity::class.java).apply {
            putExtra(OperationFormActivity.EXTRA_VEHICLE_ID, v.id)
            putExtra(OperationFormActivity.EXTRA_VEHICLE_LABEL, v.label())
            putExtra(OperationFormActivity.EXTRA_DEFAULT_MILEAGE, viewModel.defaultMileage())
            putExtra(OperationFormActivity.EXTRA_DEFAULT_DATE_ISO, viewModel.defaultDateIso())
        }
        formLauncher.launch(intent)
    }
}
