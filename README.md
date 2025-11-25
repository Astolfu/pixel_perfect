# PixelPerfect

A visual comparison tool for detecting pixel-level differences between design mockups and their implementations.

## Overview

PixelPerfect helps designers and developers ensure that implementations accurately match design specifications. Upload two images and instantly see where they differ, with a precise similarity score and multiple visualization modes.

Check video on demostration:
<a href="https://www.youtube.com/watch?v=htHVuD2t5Uw" target="_blank">
  <img src="https://img.youtube.com/vi/htHVuD2t5Uw/0.jpg" width="400" alt="Video">
</a>

## Features

- **Accurate comparison** - Pixel-by-pixel analysis with similarity scoring
- **Multiple view modes** - Overlay slider, side-by-side, and difference highlighting
- **Privacy focused** - All processing happens locally in your browser
- **Simple to use** - Drag and drop images, no account required
- **Export results** - Download comparison images for documentation

## Use Cases

### Design Quality Assurance
Upload your Figma mockup alongside a screenshot of the live implementation. Quickly identify spacing inconsistencies, color mismatches, or font size differences that might otherwise go unnoticed.

### Client Handoff
Provide objective metrics when delivering projects. Instead of subjective assessments, show clients a 98% similarity score with highlighted differences to demonstrate accuracy.

### Responsive Design Testing
Compare the same component across different breakpoints to ensure consistency. Verify that your mobile implementation maintains the same visual hierarchy as desktop.

### Visual Regression Testing
Before deploying updates, compare new screenshots against your baseline to catch unintended visual changes. Particularly useful for component library updates.

### Design System Compliance
Ensure that team members are correctly implementing shared components. Compare their work against the canonical design system examples to maintain consistency.

## Getting Started

Simply visit the live demo and start comparing images. No installation or setup required.

**Live Demo:** [https://astolfu.github.io/pixel_perfect](https://astolfu.github.io/pixel_perfect)

## Technical Details

Built with vanilla JavaScript and the Canvas API. Uses Resemble.js for the comparison algorithm. Designed to run entirely client-side with no backend dependencies.

## Local Development

```bash
git clone https://github.com/Astolfu/pixel_perfect.git
cd pixel_perfect
```

Open `index.html` in your browser or run a local server:

```bash
npx serve
```

No build process required.

## Contributing

Bug reports and feature suggestions are welcome. Please open an issue to discuss potential changes.

## License

MIT
