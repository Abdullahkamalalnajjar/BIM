# BIM Viewer Application

A modern BIM (Building Information Modeling) viewer application built with TypeScript, Three.js, and ThatOpen components.

## 🚀 Features

- 3D IFC file viewer
- Orthographic and Perspective camera views
- Measurement tools (Length & Area)
- Clipping planes for section views
- Grid visualization
- Post-processing effects
- Fragment management

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5174/`

## 🏗️ Build

Build for production:

```bash
npm run build
```

The build output will be in the `dist/` folder.

## 🌐 Deployment

### Important Notes for Production Deployment

This application uses **Web Workers** and **WebAssembly (WASM)** files to process IFC files. Make sure your hosting platform supports these features.

### Supported Hosting Platforms

#### 1. **Netlify** (Recommended)
- Simply drag and drop the `dist` folder to Netlify
- The `_headers` file is automatically configured for WASM support
- Or use Netlify CLI:
  ```bash
  npm install -g netlify-cli
  netlify deploy --prod --dir=dist
  ```

#### 2. **Vercel**
- Install Vercel CLI:
  ```bash
  npm install -g vercel
  vercel --prod
  ```
- Add `vercel.json` in root:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          },
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          }
        ]
      }
    ]
  }
  ```

#### 3. **GitHub Pages**
- Requires special configuration for WASM
- Not recommended for this project due to CORS limitations

### Required Headers

The application requires these HTTP headers for WASM and Workers to function:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

These are already configured in `public/_headers` for Netlify.

## 📁 Project Structure

```
BIM/
├── src/
│   ├── bim-components/     # Custom BIM components
│   ├── ui-templates/       # UI templates and layouts
│   ├── main.ts            # Application entry point
│   ├── globals.ts         # Global constants
│   └── style.css          # Styles
├── dist/                  # Build output
├── public/                # Static assets
└── package.json
```

## 🔧 Technologies

- **TypeScript** - Type-safe JavaScript
- **Three.js** - 3D graphics library
- **@thatopen/components** - BIM components framework
- **Vite** - Fast build tool
- **web-ifc** - IFC file parser

## 📄 License

MIT

## 👨‍💻 Author

Abdullah Al-Najjar

## 🐛 Troubleshooting

### IFC Files Not Loading on Production

If IFC files don't load after deployment:

1. **Check Browser Console** - Look for CORS or WASM errors
2. **Verify Headers** - Make sure COOP and COEP headers are set correctly
3. **Check Worker Path** - Ensure `worker.mjs` is in the root of your deployment
4. **WASM Files** - The app uses CDN for WASM files (unpkg.com)

### Local Development Issues

If you encounter issues during development:

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run dev
```

## 🌟 Features Coming Soon

- [ ] Model comparison
- [ ] Property editing
- [ ] Export capabilities
- [ ] Multi-user collaboration

