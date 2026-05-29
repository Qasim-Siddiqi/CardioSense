FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["CardioSense.API/CardioSense.API.csproj", "CardioSense.API/"]
RUN dotnet restore "CardioSense.API/CardioSense.API.csproj"
COPY . .
WORKDIR "/src/CardioSense.API"
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CardioSense.API.dll"]