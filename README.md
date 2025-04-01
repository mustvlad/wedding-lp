# Ethereal Wedding Invitation | React + Three.js

A stunning, interactive wedding invitation website featuring ethereal parallax effects, fluid distortions, and smooth animations. Built with React Three Fiber, Three.js, and Framer Motion.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmustvlad%2Fwedding-lp)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mustvlad/wedding-lp)
[![GitHub stars](https://img.shields.io/github/stars/mustvlad/wedding-lp?style=social)](https://github.com/mustvlad/wedding-lp)

![Project Preview](preview.gif) <!-- You'll need to add this GIF -->

## ✨ Features

### 🌊 Animation Effects
- Dynamic fluid simulation with realistic water ripple effects
- Multi-layered parallax heaven planes that respond to mouse movement
- Custom GLSL river shader with wave-like distortions and flowing patterns
- Interactive cursor with smooth size transitions and glow effects
- Elegant corner decorations with synchronized reveal animations
- Smooth content transitions using spring physics
- Hover-reactive RSVP button with 3D movement

### 🎨 Visual Effects
- Real-time fluid dynamics with adjustable parameters (curl, swirl, pressure)
- Seamless blend between fluid layers using custom shaders
- Depth-based parallax movement
- Smooth interpolation for all motion using spring physics
- Customizable color schemes for fluid and background

## 🛠️ Tech Stack

- React + React Three Fiber
- Three.js with custom GLSL shaders
- Framer Motion for UI animations
- Custom post-processing effects
- TailwindCSS for styling
- Vite for fast development

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/mustvlad/wedding-lp.git
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎨 Customization

### Fluid Effect Parameters
You can adjust the fluid simulation parameters in `App.jsx`:

```javascript
<Fluid
  radius={0.03}
  curl={10}
  swirl={5}
  distortion={1}
  force={2}
  pressure={0.94}
  densityDissipation={0.98}
  velocityDissipation={0.99}
  intensity={0.3}
  rainbow={false}
  blend={0}
  showBackground={true}
  backgroundColor="#a5d7e8"
  fluidColor="#d6edf5"
/>
```

### River Shader
The river effect can be customized in `RiverPass.jsx` by modifying the GLSL shader code and parameters.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/mustvlad/wedding-lp/issues).

## 👤 Author

Vlad
- GitHub: [@mustvlad](https://github.com/mustvlad)
- Website: [tuscan.wedding](https://tuscan.wedding)

## 🙏 Acknowledgments

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/)
