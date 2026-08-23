# --- Étape 1 : compilation ---------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Les .csproj d'abord : tant qu'ils ne changent pas, Docker réutilise
# le cache du restore et ne retélécharge pas les paquets NuGet.
COPY HesiasFleet.sln .
COPY HesiasFleet.Core/HesiasFleet.Core.csproj HesiasFleet.Core/
COPY HesiasFleet.Infrastructure/HesiasFleet.Infrastructure.csproj HesiasFleet.Infrastructure/
COPY HesiasFleet.API/HesiasFleet.API.csproj HesiasFleet.API/
RUN dotnet restore HesiasFleet.API/HesiasFleet.API.csproj

# Puis le code source complet
COPY HesiasFleet.Core/ HesiasFleet.Core/
COPY HesiasFleet.Infrastructure/ HesiasFleet.Infrastructure/
COPY HesiasFleet.API/ HesiasFleet.API/
RUN dotnet publish HesiasFleet.API/HesiasFleet.API.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

# --- Étape 2 : image d'exécution ---------------------------------------
# Image runtime seule (~110 Mo) : ni SDK, ni sources, ni NuGet dans le
# conteneur final — surface d'attaque et poids réduits.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "HesiasFleet.API.dll"]
