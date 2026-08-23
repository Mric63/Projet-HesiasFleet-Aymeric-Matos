package fr.hesias.fleet.ui.vehicles

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import androidx.recyclerview.widget.LinearLayoutManager
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import fr.hesias.fleet.data.model.Vehicle
import fr.hesias.fleet.databinding.ActivityVehicleListBinding
import fr.hesias.fleet.ui.detail.VehicleDetailActivity
import fr.hesias.fleet.ui.login.LoginActivity

class VehicleListActivity : AppCompatActivity() {

    private lateinit var binding: ActivityVehicleListBinding
    private val viewModel: VehicleListViewModel by viewModels()
    private val adapter = VehicleAdapter(::onVehicleSelected)

    // Lanceur du scanner QR (ZXing). Le résultat revient dans le callback.
    private val scanLauncher = registerForActivityResult(ScanContract()) { result ->
        val contents = result.contents
        if (contents == null) {
            Toast.makeText(this, "Scan annulé", Toast.LENGTH_SHORT).show()
            return@registerForActivityResult
        }
        val vehicle = viewModel.findByScan(contents)
        if (vehicle != null) {
            onVehicleSelected(vehicle)
        } else {
            Toast.makeText(this, "Aucun véhicule ne correspond à « $contents »", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVehicleListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Véhicules"
        supportActionBar?.subtitle = viewModel.userName()

        binding.recyclerVehicles.layoutManager = LinearLayoutManager(this)
        binding.recyclerVehicles.adapter = adapter

        binding.searchInput.doAfterTextChanged { viewModel.filter(it?.toString() ?: "") }

        binding.fabScan.setOnClickListener { launchScanner() }

        binding.swipeRefresh.setOnRefreshListener { viewModel.load() }

        viewModel.state.observe(this) { render(it) }
        viewModel.load()
    }

    private fun render(state: VehiclesState) {
        binding.swipeRefresh.isRefreshing = state is VehiclesState.Loading
        when (state) {
            is VehiclesState.Loading -> { /* indicateur géré par swipeRefresh */ }
            is VehiclesState.Loaded -> {
                adapter.submitList(state.vehicles)
                binding.textEmpty.visibility =
                    if (state.vehicles.isEmpty()) View.VISIBLE else View.GONE
            }
            is VehiclesState.Error -> {
                Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
            }
            is VehiclesState.Unauthorized -> backToLogin()
        }
    }

    private fun launchScanner() {
        val options = ScanOptions().apply {
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            setPrompt("Scannez le QR code du véhicule")
            setBeepEnabled(true)
            setOrientationLocked(false)
        }
        scanLauncher.launch(options)
    }

    private fun onVehicleSelected(vehicle: Vehicle) {
        // Ouvre le journal du véhicule, d'où l'on peut saisir une opération.
        val intent = Intent(this, VehicleDetailActivity::class.java).apply {
            putExtra(VehicleDetailActivity.EXTRA_VEHICLE, vehicle)
        }
        startActivity(intent)
    }

    private fun backToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    // --- Menu déconnexion ---
    override fun onCreateOptionsMenu(menu: android.view.Menu): Boolean {
        menuInflater.inflate(fr.hesias.fleet.R.menu.menu_vehicle_list, menu)
        return true
    }

    override fun onOptionsItemSelected(item: android.view.MenuItem): Boolean {
        return if (item.itemId == fr.hesias.fleet.R.id.action_logout) {
            viewModel.logout()
            backToLogin()
            true
        } else super.onOptionsItemSelected(item)
    }
}
