# Table Configurator
A ReactJS application for configuring a customizable table with 3D visualization using Three.js.

## Features
1. **Table Display:** View and interact with a 3D table model.
2. **Camera Controls:** Rotate, zoom, and pan the camera.
3. **Resizing:** Adjust table width, depth, and leg height:
    - Width: 1200 mm to 2400 mm
    - Depth: 300 mm to 900 mm
    - Leg height: 500 mm to 1200 mm
4. **Material Switching:** Choose from 5 different materials:
    - Ashwood, Cedar, Plastic Black, Plastic White, Walnut.
5. **Support Switching:** Select between two types of table supports.

## Technologies
-   **ReactJS**: Frontend framework.
-   **Three.js**: 3D rendering.
-   **TypeScript**: Typed JavaScript.

## Installation and Setup
Follow these steps to run the application locally:


### Prerequisites
-   **Node.js** (v14 or newer)
-   **npm** or **yarn**


### Clone the Repository
```plainText
git clone https://github.com/DigitalM0nster/Table-Configurator.git
cd table-configurator
```

### Install Dependencies
Run the following command to install all required dependencies:
```plainText
npm install
```

### Run the Application in Development Mode
To run the application in development mode, use the following command:
```plainText
npm run dev
```

After running, the application will be available at the URL shown in the terminal (usually http://localhost:3000).
To test application with mobile - run the application with this command(but type your IPv4 adress):
```plainText
npm run dev -- --host 192.168.0.110
```

After that you will see the link to open your application in browser.


### Build for Production
To create an optimized production build, use the command:
```plainText
npm run build
```

The built files will be located in the dist directory (default for Vite).


### File Structure
```plainText
TABLE-CONFIGURATOR/
├── node_modules/ # Installed Node.js dependencies
├── public/ # Public files accessible directly from the browser
│ ├── fonts/ # Fonts
│ │ └── Jost-VariableFont_wght.ttf
│ ├── images/ # Images for the UI and supports
│ ├── materials/ # Tabletop materials
│ └── models/ # 3D models of table legs and supports
│ ├── leg.glb
│ ├── legCustom.glb
│ ├── prop_01.glb
│ ├── prop_02.glb
│ ├── tableCustom.blend
│ └── tableCustom.glb
├── src/ # Application source code
│ ├── components/ # React components
│ │ ├── 3D/ # Components for Three.js integration
│ │ │ ├── scenes/ # Logic for scenes and 3D objects
│ │ │ │ ├── TableScene.d.ts # TypeScript type definitions
│ │ │ │ ├── TableScene.js # Main Three.js class
│ │ │ │ └── MainScene.tsx # Main React scene
│ │ │ └── styles.module.scss # Styles for 3D components
│ │ ├── HTML/ # Components for the user interface
│ │ │ ├── configs/ # Configurators (sizes, materials, supports)
│ │ │ │ ├── LegConfigurator.tsx
│ │ │ │ ├── MaterialSelector.tsx
│ │ │ │ ├── SizeConfigurator.tsx
│ │ │ │ ├── SupportsSelector.tsx
│ │ │ │ └── styles.module.scss
│ │ │ ├── preloader/ # Preloader and loading tracker
│ │ │ │ ├── Preloader.tsx
│ │ │ │ ├── TrackPageLoad.d.ts
│ │ │ │ ├── TrackPageLoad.js
│ │ │ │ └── styles.module.scss
│ │ └── CSS/ # General styles
│ │ ├── fonts.scss
│ │ ├── index.scss
│ │ └── App.scss
│ ├── App.tsx # Application entry point
│ └── main.tsx # Main React file
├── vite.config.ts # Vite configuration file
├── package.json # List of dependencies and scripts
└── README.md # Project documentation
```
