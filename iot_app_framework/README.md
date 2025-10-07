# Digi IoT Application Framework

Welcome to the **Digi IoT Application Framework**! This web application demonstrates how to interact with and utilize the APIs offered by Digi Remote Manager to manage a fleet of devices, such as Digi ConnectCore modules or Digi XBee devices.

The demo application is tailored for the public tranportation market and works in conjunction with the **Digi IoT Device Simulator**, which simulates a fleet of transit buses. However, it can also serve as a foundation for other markets. If you are developing your own web application, you can use the simulator to replicate a fleet of devices before deploying real devices in the field.

This application is built using **Next.js**, a powerful and versatile full-stack React framework. To learn more about Next.js, visit the [official documentation](https://nextjs.org/docs).

## Requirements

Before getting started, ensure you have the following tools and accounts:

* **[Node.js 18.18](https://nodejs.org/)** or later.
* **[Digi IoT Device Simulator 1.0.1](https://www.digi.com/resources/documentation/digidocs/device-simulator/doc/)** or later.
* A compatible IDE, such as **[Visual Studio Code](https://code.visualstudio.com/)**.
* A **[Digi ConnectCore Cloud Services](https://www.digi.com/products/embedded-systems/digi-connectcore/software-and-tools/cloud-services)** account.

## Setting up the simulation

To run this web application, you first need to launch the Digi IoT Device Simulator. Follow these steps:

1. [Install the Digi IoT Device Simulator](https://www.digi.com/resources/documentation/digidocs/device-simulator/doc/ds-gs-install_t.html) and its dependencies if not already done before.
2. Open a terminal or console.
3. Go to the Digi IoT Device Simulator directory:
    - Windows:
      ```powershell
      cd <installation_dir>\DeviceSimulator
      ```
    - Linux or macOS:
      ```bash
      cd <installation_dir>/DeviceSimulator
      ```
4. Start the simulator with the *smartcity-sample* simulation:
    - Windows:
      ```powershell
      .\dsimulator.bat -s samples\smartcity-sample
      ```
    - Linux or macOS:
      ```bash
      ./dsimulator -s samples/smartcity-sample
      ```
5. When prompted, enter your Digi Remote Manager credentials.
6. The simulation is now running. You can stop its execution by using `Ctrl+C`.

## Running the web application

Once the simulation is active and the simulated devices are registered in your Digi Remote Manager account, you can start the web application:

1. **Install dependencies** (required only the first time):
    - If you are using Visual Studio Code, go to the **Run and Debug** view, select the **Install dependencies** configuration and press the green play button.
    - Otherwise, run `npm install --legacy-peer-deps`.
2. **Start the development server**:
    - If you are using Visual Studio Code, select the **Launch app** configuration and press the green play button.
    - Otherwise, run `npm run dev`.
3. Open [http://localhost:3001](http://localhost:3001) with your browser to see the demo in action.
4. Log in using your Digi Remote Manager account credentials.

## Exploring the application

Upon accessing the application, you will first see the login page, where you need to enter your Digi Remote Manager credentials. After logging in, you will be directed to the main dashboard, where you can navigate between three main sections: **Dashboard**, **Location**, and **Management**.

### Dashboard

The **Dashboard** is the central hub of the application, offering a comprehensive overview of the current status of the transit buses. At the top, two status charts provide real-time data on bus connections and route compliance. Right to the charts, a list displays active alerts triggered by specific events, such as bus disconnections, deviations from routes, or parameter anomalies (e.g., engine temperature or tire pressure issues).

The lower section of the dashboard presents a detailed table of all transit buses. For each bus, you can view critical information, such as its current status and key metrics, and perform actions like sending messages or viewing the bus location on a map. Clicking on a bus in the table opens a detailed view, providing individual charts and historical data for parameters like passenger count, power level, engine temperature, and tire pressure.

One of the standout features of this page is its real-time updating capability. Data is automatically refreshed whenever an event occurs, such as a connection status change or parameter update. This is achieved using monitors, which listen for events on Digi Remote Manager and push updates to the application asynchronously, eliminating the need for manual page refreshes.

### Location

The **Location** page provides a map-based visualization of all transit buses and their respective routes. Each bus is represented by a marker, with its color indicating connection status: green for connected and red for disconnected. The buses' positions are dynamically updated as new location data is received, ensuring the map remains accurate in real time.

Clicking on a bus marker opens a detailed view, showing its name, route number, and key parameters such as passenger count, power level, and engine temperature. From this dialog, you can also send messages to the bus, provided it is connected. The map toolbar includes controls to center the view on all buses or to filter buses by routes, enabling you to customize the map display based on your preferences.

This page is designed to give a quick and intuitive overview of the fleet's spatial distribution and connectivity status, making it an essential tool for monitoring operations in real time.

### Management

The **Management** page focuses on configuring and maintaining the fleet of buses. The top panel displays a list of **templates**, which define configuration settings for devices. These templates ensure that devices remain compliant with the desired configuration, enabling automated scanning and updates. You can create new templates using the *Add template* button in the panel header.

> [!NOTE]
> Digi Remote Manager templates are used to have fleets of devices automatically scanned, updated, and kept in compliance with the configuration you set on them. Templates are a key feature for maintaining large fleets, as they streamline updates and minimize manual intervention. For more information on templates, consult the [templates user guide](https://www.digi.com/resources/documentation/Digidocs/Templates_user_guide/home.htm/Templates_user_guide/Home.htm).

The bottom panel displays a list of **custom firmware**. Before creating a template, you must upload at least one firmware version. This can be done using the *Add firmware* button in panel header. Uploaded firmware versions are stored and can be assigned to templates, ensuring that devices in the fleet run compatible and up-to-date software.

### Cloud log

Each page in the application includes access to the **Cloud Log**, a utility that logs all interactions between the application and Digi Remote Manager. As you navigate the application, the Cloud Log records detailed information about every API request and response, including timestamps, HTTP methods, and endpoints. Clicking on a specific log entry reveals additional details, such as the request body and the corresponding response.

The toolbar in the Cloud Log offers options to filter traffic, export the log, clear the log, and maximize or close the view. This tool is invaluable for debugging and understanding the application's interactions with Digi Remote Manager.

## How the application works

This application leverages the APIs provided by Digi Remote Manager to fetch, represent, and interact with device data. Whether you are working with simulated or real devices, the APIs provide a consistent interface for managing resources like alerts, templates, and firmware.

> [!NOTE]
> For more information about the Digi Remote Manager APIs, visit the [official documentation](https://doc-remotemanager.digi.com/).

In addition to the requests that components do when each page loads, the application registers three monitors that listen for event in real time, so the application is more efficient and does not overload Digi Remote Manager with unnecessary requests:

* **Alerts** (`alert_status`): tracks alert events (fired, reset, or acknowledged).
* **Devices** (`devices`): monitors device connectivity, location updates, and route compliance.
* **Streams** (`DataPoint`): detects changes in device parameters like bus line, passenger count, power level, engine temperature, or tire pressure.

Authentication, both at application level and for the communication with Digi Remote Manager, is handled using [NextAuth.js](https://next-auth.js.org/getting-started/introduction), one of the most complete authentication libraries for Next.js applications. It is based on the Digi Remote Manager credentials, which are used for the HTTP basic authentication on every interaction with the Digi Remote Manager APIs.

## Code structure

The source code of the Digi IoT Fleet Management Demo is well-organized to ensure maintainability, scalability, and clarity. Below is a detailed breakdown of the folder structure and its purpose:

### `src` folder

This is the main folder containing the application's source code. It is further divided into several subfolders, each focusing on a specific aspect of the application:

* `app`: this folder contains the routing structure of the Next.js application. It is split into two primary groups to manage authenticated and unauthenticated routes separately:
  * The `(authenticated)` folder contains routes that require user authentication. These routes include:
    * `api`: handles server-side logic and API routes called by the frontend.
      * `auth`: manages user authentication using *NextAuth.js*.
      * `monitor`: handles communication with Digi Remote Manager's monitors, ensuring real-time event updates in the frontend.
      * `routes`: fetches and parses IoT route data for simulated devices.
    * `dashboard` , `location` and `management`: define the layout and logic for the corresponding pages in the application.
  * The `(unathenticated)` folder contains routes accessible without authentication, such as the login and logout pages.

* `components`: this folder houses reusable React components, serving as the building blocks of the user interface. These components are shared across multiple pages, ensuring consistency in design and reducing duplication of code.

* `configs`: a collection of constants and configuration files used throughout the application. This includes API endpoints, default values, and other global settings.

* `contexts`: contains React context providers, which enable state and functionality to be shared across multiple components without the need for prop drilling.

* `models`: defines complex data structures and encapsulates business logic related to specific entities in the application.

* `services`: this folder contains managers and helper classes responsible for interacting with Digi Remote Manager APIs. Each service focuses on a particular resource or feature, such as managing templates, handling alerts, or fetching bus details. The separation of concerns ensures that API logic remains isolated from the rest of the application.

* `types`: includes TypeScript type definitions and interfaces used throughout the project. These definitions ensure strong typing and reduce runtime errors by enforcing consistency in data structures.

* `utils`: a collection of utility functions and helper modules for common tasks, such as formatting dates, parsing API responses, or handling validation. These functions are generic and reusable, serving as the backbone for various operations across the application.

### `public` folder

This folder contains static assets such as images, icons, and stylesheets. These resources are directly accessible to the browser and are often referenced in the application's HTML or components. Examples include logos, background images, and external CSS files used for styling.

### `data` folder

This folder stores JSON files that define the various bus lines simulated by the **Digi IoT Device Simulator**. These files are used by the application to visualize routes and associate them with buses. This folder acts as a bridge between the simulation environment and the frontend, ensuring consistency in route data.

## License

Copyright 2024-2025, Digi International Inc.

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, you can obtain one at https://mozilla.org/MPL/2.0/.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.