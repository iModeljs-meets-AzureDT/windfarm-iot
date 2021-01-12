# windfarm-iot

## Overview of file structure

![Dataflow Diagram](./images/DataflowDiagram.png)

### **1. azure-function**

The azure-function serves as the mediator between IoT Hub and the itwin viewer.

Responsibilities include:

1. Retrieving and parsing data from IoT Hub.
2. Sending parsed data to Physics Model API to generate predicted physical model power.
3. Sending parsed data to Machine Learning API to generate predicted machine learning model power.
4. Retrieving DTDL from imodeljs and pushing to an ADT instance.
6. Routing weather forecasted data to PM/ML APIs to generate predicted power.

### **2. itwin-viewer**

The itwin-viewer is the UI visualizer for the windfarm.

Responsibilties include:
1. Configuring the imodel connection and authorization to use Bentley Systems CONNECT services
2. Render specified models and reality mesh for the windfarm.
3. Load reality data and Bing map to provide terrain graphics.
3. Retrieve data from ADT and emit the data across the application.

### **3. windfarm-extension**

This extension adds UI components and functionality to our viewer.

1. Visualize live Iot sensor data and warning/errors from the ADT instance via markers and decorators.
2. Creates an alert system for unexpected power outputs given from Machine and Physics learning models.
3. Provide a historical data via Azure Time Series Insights to visualize past power output readings.
 and predicted power from Physics and Machine Learning Model.
