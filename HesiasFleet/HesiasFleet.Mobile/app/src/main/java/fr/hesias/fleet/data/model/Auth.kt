package fr.hesias.fleet.data.model

/** Corps de POST api/auth/login */
data class LoginRequest(
    val login: String,
    val password: String
)

/** Réponse de POST api/auth/login (AuthResponseDto côté API) */
data class AuthResponse(
    val token: String,
    val user: User
)

/** UserDto — le hash du mot de passe n'est jamais exposé par l'API */
data class User(
    val id: Int,
    val lastName: String,
    val firstName: String,
    val function: String,
    val email: String,
    val login: String
)
