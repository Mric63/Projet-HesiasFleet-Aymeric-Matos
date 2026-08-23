package fr.hesias.fleet.ui.login

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.LiveData
import androidx.lifecycle.viewModelScope
import fr.hesias.fleet.data.api.ApiClient
import fr.hesias.fleet.data.model.LoginRequest
import fr.hesias.fleet.data.session.SessionManager
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

sealed interface LoginState {
    data object Idle : LoginState
    data object Loading : LoginState
    data object Success : LoginState
    data class Error(val message: String) : LoginState
}

class LoginViewModel(app: Application) : AndroidViewModel(app) {

    private val session = SessionManager.getInstance(app)
    private val api = ApiClient.get(app)

    private val _state = MutableLiveData<LoginState>(LoginState.Idle)
    val state: LiveData<LoginState> = _state

    /** True si un token valide est déjà stocké : on saute alors l'écran de login. */
    fun alreadyLoggedIn(): Boolean = session.isLoggedIn()

    fun login(login: String, password: String) {
        if (login.isBlank() || password.isBlank()) {
            _state.value = LoginState.Error("Login et mot de passe requis.")
            return
        }

        _state.value = LoginState.Loading
        viewModelScope.launch {
            try {
                val response = api.login(LoginRequest(login.trim(), password))
                session.token = response.token
                session.userDisplayName = "${response.user.firstName} ${response.user.lastName}"
                _state.value = LoginState.Success
            } catch (e: HttpException) {
                val msg = if (e.code() == 401) "Login ou mot de passe incorrect."
                          else "Erreur serveur (${e.code()})."
                _state.value = LoginState.Error(msg)
            } catch (e: IOException) {
                _state.value = LoginState.Error("Impossible de joindre le serveur. Vérifiez la connexion.")
            }
        }
    }
}
