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