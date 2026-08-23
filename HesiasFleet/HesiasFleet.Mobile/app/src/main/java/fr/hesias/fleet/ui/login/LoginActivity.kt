package fr.hesias.fleet.ui.login

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import fr.hesias.fleet.databinding.ActivityLoginBinding
import fr.hesias.fleet.ui.vehicles.VehicleListActivity

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: LoginViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Déjà connecté : on va directement à la liste des véhicules.
        if (viewModel.alreadyLoggedIn()) {
            goToVehicles()
            return
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.buttonLogin.setOnClickListener {
            viewModel.login(
                binding.editLogin.text.toString(),
                binding.editPassword.text.toString()
            )
        }

        viewModel.state.observe(this) { state ->
            when (state) {
                is LoginState.Loading -> setLoading(true)
                is LoginState.Success -> goToVehicles()
                is LoginState.Error -> {
                    setLoading(false)
                    binding.textError.text = state.message
                    binding.textError.visibility = android.view.View.VISIBLE
                }
                is LoginState.Idle -> setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.progress.visibility = if (loading) android.view.View.VISIBLE else android.view.View.GONE
        binding.buttonLogin.isEnabled = !loading
        if (loading) binding.textError.visibility = android.view.View.GONE
    }

    private fun goToVehicles() {
        startActivity(Intent(this, VehicleListActivity::class.java))
        finish()
    }
}
