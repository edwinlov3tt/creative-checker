# Creative Specs Checker

A powerful web application for validating creative assets against platform specifications, with automatic ZIP extraction and AI-powered analysis.

🔗 **Live Demo**: [https://creative-tester.edwin-6f1.workers.dev/](https://creative-tester.edwin-6f1.workers.dev/)

## Features

### 📁 File Processing
- **Multi-format Support**: Upload images (JPG, PNG, GIF, WebP), videos (MP4, MOV, WebM), and ZIP archives
- **ZIP Extraction**: Automatically extracts and processes creative assets from ZIP files
- **Batch Processing**: Handle multiple files simultaneously with real-time progress updates
- **Drag & Drop**: Intuitive drag-and-drop interface for file uploads

### ✅ Specification Validation
Validates creative dimensions and formats against major platforms:

#### Banner Ads
- **Ignite**: 728x90, 300x250, 160x600, 300x600, 320x50
- **AMPed**: 300x250, 728x90, 640x100, 320x50
- File size limits enforced (200KB default, 150KB mobile)

#### Social Media
- **Facebook**: 1080x1080, 1080x1920
- **Instagram**: Stories, Square posts
- **TikTok**: 1080x1920, 720x1280
- **LinkedIn**: 1080x1080
- **Pinterest**: 1000x1500
- **Snapchat**: 1080x1920

#### Video Platforms
- **STV/Hulu/Netflix**: 1920x1080
- **Live Sports**: 1920x1080
- Duration and format validation

#### Specialty Formats
- **Spark**: Landscape, Square, Portrait, Logo variations
- **AMPed Products**: Content Sponsorship, Listen Live, Mobile Billboard, Takeover

### 🤖 AI-Powered Analysis
- **Quality Assessment**: Rates creative quality (Excellent, Good, Fair, Needs Improvement)
- **Theme Detection**: Identifies creative themes (Product Focus, Lifestyle, Brand Awareness, etc.)
- **Style Classification**: Detects visual styles (Modern, Classic, Bold, Minimalist, Vibrant)
- **Element Detection**: Identifies presence of text, CTAs, logos, and dominant colors
- **Platform Suggestions**: Recommends optimal platforms based on dimensions
- **Smart Recommendations**: Provides actionable improvement suggestions

### 📊 Export & Reporting
- **JSON Export**: Detailed analysis results in JSON format
- **CSV Export**: Spreadsheet-compatible format for bulk analysis
- **Real-time Statistics**: Live summary of processed files, compliance rates, and file types

### ⚙️ Customization
- **Specs Settings**: Customize platform specifications to match your requirements
- **Editable File Names**: Rename files within the interface
- **Persistent Configuration**: Settings saved for future sessions

## Getting Started

### Prerequisites
- Node.js 14+ and npm

### Installation
```bash
# Clone the repository
git clone https://github.com/edwinlov3tt/creative-checker.git
cd creative-checker

# Install dependencies
npm install

# Start development server
npm start
```

### Building for Production
```bash
# Create optimized production build
npm run build

# The build folder contains static files ready for deployment
```

## Usage

1. **Upload Files**: Drag and drop files or click to browse
2. **Automatic Processing**: Files are analyzed immediately upon upload
3. **Review Results**: 
   - Check spec compliance (green checkmarks for matches)
   - Review AI analysis and recommendations
   - View suggested platforms
4. **Export Data**: Download results as JSON or CSV for reporting

## Technology Stack

- **React 19**: Latest React with hooks for state management
- **Tailwind CSS**: Utility-first CSS for responsive design
- **Lucide React**: Beautiful icon library
- **JSZip**: Client-side ZIP file processing
- **Create React App**: Zero-configuration build setup

## Deployment

### Cloudflare Workers
The application is deployed on Cloudflare Workers for global edge distribution:
- Build the project: `npm run build`
- Deploy the `build` folder contents to Cloudflare Workers
- Access at your Workers URL

### Other Platforms
The production build can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Project Structure

```
creative-checker/
├── public/              # Static assets
├── src/
│   ├── App.js          # Main CreativeChecker component
│   ├── App.css         # Global styles
│   └── index.js        # Application entry point
├── build/              # Production build (generated)
├── package.json        # Dependencies and scripts
└── CLAUDE.md          # Claude Code documentation
```

## Development

### Available Scripts
- `npm start` - Start development server (localhost:3000)
- `npm test` - Run tests in watch mode
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App (one-way operation)

### Key Components

#### CreativeChecker (src/App.js)
The main component handling:
- File upload and processing
- ZIP extraction logic
- Specification validation
- AI analysis simulation
- Export functionality
- Settings management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is available for use under standard open source terms.

## Support

For issues or questions, please open an issue on [GitHub](https://github.com/edwinlov3tt/creative-checker/issues).