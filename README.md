# Logo Creator - Open Source Logo Design Tool

A modern, web-based logo creation tool built with Next.js, React, and TypeScript. Create professional logos with customizable icons, text, colors, and effects, then export in multiple formats.

## 🚀 Features

- **Icon Library**: 500+ Lucide React icons
- **Text Customization**: 30+ font families with full typography controls
- **Color System**: Gradients, solid colors, and transparency support
- **Export Formats**: SVG, PNG, JPEG, and PDF with high-quality output
- **Real-time Preview**: Live preview with instant updates
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Preset Templates**: Quick-start templates for different industries
- **AI Integration**: AI-powered logo generation (optional)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React (500+ icons)
- **Export**: Canvas API + jsPDF for multi-format export
- **State Management**: useReducer with history support

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/logo-creator.git

# Navigate to project directory
cd logo-creator

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 🎨 Usage

1. **Choose an Icon**: Browse through 500+ icons or search by keyword
2. **Customize Design**: Adjust colors, gradients, borders, and shadows
3. **Add Text**: Include company name or tagline with custom typography
4. **Apply Presets**: Use pre-designed templates for quick starts
5. **Export Logo**: Download in SVG, PNG, JPEG, or PDF format

## 🔧 Configuration

### Environment Variables

\`\`\`env
# Optional: AI Logo Generation
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
\`\`\`

### Customization

- **Add Icons**: Import additional icons in `components/icon-selector.tsx`
- **Add Fonts**: Extend font options in `components/text-customization.tsx`
- **Add Presets**: Create new templates in `components/preset-selector.tsx`
- **Modify Export**: Customize export options in `lib/download-utils.ts`

## 📁 Project Structure

\`\`\`
logo-creator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── page.tsx          # Main application
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── color-picker.tsx  # Color selection
│   ├── icon-selector.tsx # Icon browser
│   ├── logo-preview.tsx  # Live preview
│   └── text-customization.tsx # Typography controls
├── lib/                  # Utilities
│   ├── download-utils.ts # Export functionality
│   └── history-reducer.ts # State management
└── README.md
\`\`\`

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contribution Guidelines

- **Code Style**: Follow existing TypeScript/React patterns
- **Testing**: Test all export formats and responsive design
- **Documentation**: Update README for new features
- **Performance**: Ensure changes don't impact performance
- **Accessibility**: Maintain WCAG 2.1 AA compliance

### Areas for Contribution

- 🎨 **New Icon Sets**: Add more icon libraries
- 🔤 **Font Integration**: Add Google Fonts or custom fonts
- 🎯 **Templates**: Create industry-specific logo templates
- 🚀 **Performance**: Optimize rendering and export speed
- 🌐 **Internationalization**: Add multi-language support
- 📱 **Mobile UX**: Improve mobile experience
- 🤖 **AI Features**: Enhance AI logo generation
- 🎨 **Effects**: Add text effects, shadows, outlines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

\`\`\`
MIT License

Copyright (c) 2024 Logo Creator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

## 🙏 Acknowledgments

- [Lucide](https://lucide.dev/) for the beautiful icon library
- [shadcn/ui](https://ui.shadcn.com/) for the component system
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the framework
- All contributors who help improve this project

## 📞 Support

- 📧 Email: support@logocreator.dev
- 💬 Discord: [Join our community](https://discord.gg/logocreator)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/logo-creator/issues)
- 📖 Docs: [Documentation](https://docs.logocreator.dev)

## 🗺️ Roadmap

- [ ] Advanced text effects (gradients, outlines, shadows)
- [ ] Multi-icon logos and icon combinations
- [ ] Brand kit generation (color palettes, typography)
- [ ] Collaboration features
- [ ] API for programmatic logo generation
- [ ] Plugin system for custom extensions
- [ ] Advanced AI features with style transfer
- [ ] Logo animation and motion graphics

---

Made with ❤️ by the open-source community
\`\`\`

Finally, let's add a license file:

```text file="LICENSE"
MIT License

Copyright (c) 2024 Logo Creator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
