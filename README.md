# windfarm-iot

## Overview of file structure

### **1. azure-function**

The azure-function serves as the mediator between IoT Hub and the itwin viewer.

Responsibilities include:

1. Retrieving and parsing data from IoT Hub.
2. Sending parsed data to Physics Model API to generate predicted physical model power.
3. Sending parsed data to Machine Learning API to generate predicted machine learning model power.
4. Retrieving DTDL from imodeljs and pushing to an ADT instance.
6. Routing specific 'manual' requests to PM/ML APIs to generate predicted power from the itwin-viewer.

### **2. itwin-viewer**

The itwin-viewer is the UI visualizer for the windfarm.

Responsibilties include:
1. Render required models and reality mesh for the windfarm.
2. Retrieve data from ADT to display IoT data and predicted power from Physics and Machine Learning Model.
3. Visualize live Iot sensor data and warning/errors from the ADT instance.
4. Provide a historical time slider to visualize past events
5. Provide a UI to send inputs back to the azure function to predict manually manipulated variables.

### **3. windfarm-extension**

This extension adds UI components and functionality to our viewer.

### **4. device-simulation**

How to set up simulation:

1. Go to ["Azure IoT Device Simulation"](https://windfarmsimulation-m6vf5.azurewebsites.net/devicemodels)
2. Select "Device Models" menu and click "Add Device Models" 
3. upload all the json and js files in the Advanced tab.
4. Select Simulations menu and click "New Simulation" 
5. Set up wind turbine simulation

### **5. local-backend**

This directory exists to kick off a local backend. A local backend is required to animate the spinning turbines, 
- At the time of this commit, functionality prior to 2.9.0 does not support necessary API calls to transform turbines properly.

### **6. model-animation**

This directory contains the json file that describes the render schedule used to rotate the turbines.  This file was generated programmatically using frontend code, exported, the manually edited to the correct format required by the [iModel.js SYNCHRO Schedule Importer](https://github.com/imodeljs/imodeljs/tree/master/test-apps/synchro-schedule-importer).  The schedule must be imported into the iModel itself for the tiles to be updated correctly on the backend.