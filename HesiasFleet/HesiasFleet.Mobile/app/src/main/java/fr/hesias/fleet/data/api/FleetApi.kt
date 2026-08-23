package fr.hesias.fleet.data.api

import fr.hesias.fleet.data.model.AuthResponse
import fr.hesias.fleet.data.model.CreateMetaOperation
import fr.hesias.fleet.data.model.CreateOperation
import fr.hesias.fleet.data.model.LoginRequest
import fr.hesias.fleet.data.model.MetaOperation
import fr.hesias.fleet.data.model.Note
import fr.hesias.fleet.data.model.Operation
import fr.hesias.fleet.data.model.Vehicle
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/**
 * Contrat REST de l'API Hesias Fleet.
 * Chaque méthode correspond à un endpoint d'un controller ASP.NET Core.
 */
interface FleetApi {

    // AuthController — POST api/auth/login
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    // VehiclesController — GET api/vehicles
    @GET("vehicles")
    suspend fun getVehicles(): List<Vehicle>

    // OperationsController
    @GET("operations/vehicle/{vehicleId}")
    suspend fun getOperationsByVehicle(@Path("vehicleId") vehicleId: Int): List<Operation>

    @POST("operations")
    suspend fun createOperation(@Body body: CreateOperation): Operation

    // MetaOperationsController
    @GET("metaoperations/vehicle/{vehicleId}")
    suspend fun getMetaOperationsByVehicle(@Path("vehicleId") vehicleId: Int): List<MetaOperation>

    @POST("metaoperations")
    suspend fun createMetaOperation(@Body body: CreateMetaOperation): MetaOperation

    // NotesController
    @GET("notes/vehicle/{vehicleId}")
    suspend fun getNotesByVehicle(@Path("vehicleId") vehicleId: Int): List<Note>
}
