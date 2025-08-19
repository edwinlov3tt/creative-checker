# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server at http://localhost:3000
- `npm run build` - Create production build in ./build folder
- `npm test` - Run tests in interactive watch mode
- `npm test -- --watchAll=false` - Run tests once (CI mode)
- `./test-workflow.sh` - Run complete test suite before deployment

### Dependencies
- `npm install` - Install all dependencies

## Git Workflow

### Branch Strategy
- `main` - Production branch (protected, deployed to Vercel)
- `develop` - Development branch for testing changes

### Testing Workflow
1. **Local Development**: Work on `develop` branch
2. **Pre-commit Testing**: Run `./test-workflow.sh` to validate changes
3. **Push to GitHub**: `git push origin develop`
4. **Create Pull Request**: Open PR from `develop` to `main`
5. **Automated Testing**: GitHub Actions runs tests on PR
6. **Vercel Preview**: Automatic preview deployment for PR
7. **Merge to Main**: After review and tests pass

### Quick Commands
```bash
# Switch to develop branch
git checkout develop

# Run full test suite
./test-workflow.sh

# Push changes
git add .
git commit -m "Your message"
git push origin develop

# Create PR (using GitHub CLI)
gh pr create --base main --title "Your PR title"
```

## Architecture

This is a React application built with Create React App for creative asset specification checking and analysis.

### Core Application: CreativeChecker Component (src/App.js:5-906)

The single-page application provides comprehensive creative asset validation against multiple platform specifications.

**Key Features:**
1. **File Processing**: Handles individual files and ZIP archives containing creative assets
2. **Specification Validation**: Checks dimensions, file sizes, and formats against platform requirements
3. **AI-powered Analysis**: Provides creative quality assessment, theme detection, and recommendations
4. **Multi-format Support**: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, WebM), and ZIP archives

**Supported Platforms:**
- Banner Ads (Ignite, AMPed)
- Social Media (Facebook, Instagram, Pinterest, LinkedIn, TikTok, Snapchat)
- Video Platforms (STV, Hulu, Netflix, Live Sports)
- Spark creative formats
- AMPed products (Content Sponsorship, Listen Live, Mobile Billboard, Takeover)

**Data Flow:**
1. Files uploaded via drag-drop or file picker
2. ZIP files automatically extracted (processZipFile function)
3. Media dimensions extracted via HTML5 Image/Video APIs
4. Specifications checked against hardcoded platform requirements
5. AI analysis simulated with randomized creative insights
6. Results exportable as JSON or CSV

**State Management:**
- Uses React hooks (useState) for local state
- No external state management libraries
- Specs stored in component state with settings panel for customization

## Testing Considerations

The project uses Jest and React Testing Library (already configured via Create React App). Test files should follow the pattern `*.test.js` or be placed in `__tests__` folders.