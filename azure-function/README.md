# Getting Started with the WindFarmIot Azure Function

## Environment Variables

Prior to running the function app locally, you'll need to declare some environment variables:

1. Create "local.settings.json" in root of directory (if running vscode, this should automatically get created with azure function extension)

At a minimum, it should contain:

# ---- local.settings.json example ----
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet",
    "EventHubConnectionAppSetting": "Endpoint=sb://..."
  }
}

```
You can retrieve the "EventHubConnectionAppSetting" value from resource "iothub-m6vf5" under "Built-in endpoints"

## How to run

1. Restore the packages required via running `dotnet restore --interactive` in the root of the project
	a. If you're getting permission issues, add a local nuget.config and install the azure artifacts credential provider by running: iex "& { $(irm https://aka.ms/install-artifacts-credprovider.ps1) }"
2. Run a local azure storage emulator to bind to the azure function. A simple emulator is "Microsoft Azure Storage Emulator". You can install and download the software here: https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator
3. Ensure local.settings.json exists in the root directory looking similar to above example.
4. You may need to run "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
5. "Run" the code in your IDE. 

You can run it manually via command prompt:

dotnet.exe clean /property:GenerateFullPaths=true /consoleloggerparameters:NoSummary
dotnet.exe build /property:GenerateFullPaths=true /consoleloggerparameters:NoSummary
func host start

6. If server is on "Now listening...", you'll need to run the simulation device via:
https://windfarmsimulation-m6vf5.azurewebsites.net/simulations/be194ffa-ae02-4d98-86a5-eed61628c27d/befc2d4d-1093-4a29-aa99-a778e26cc128

