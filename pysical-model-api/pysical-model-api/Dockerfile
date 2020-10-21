#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["pysical-model-api/pysical-model-api.csproj", "pysical-model-api/"]
RUN dotnet restore "pysical-model-api/pysical-model-api.csproj"
COPY . .
WORKDIR "/src/pysical-model-api"
RUN dotnet build "pysical-model-api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "pysical-model-api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "pysical-model-api.dll"]