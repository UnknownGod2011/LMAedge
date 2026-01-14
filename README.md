# EdgeLedger Solutions - AI-Powered Loan Management

A sophisticated digital loan record management and analytics platform with AI-powered document analysis, built for financial institutions.

## 🚀 New: AI Document Analysis

**Upload a loan agreement PDF and get instant AI-powered analysis:**
- ✅ Automatic section extraction and organization
- ✅ Key metrics identification (principal, rate, term, covenants)
- ✅ Smart status indicators (✓ ok, ? warning)
- ✅ Interactive AI chatbot for Q&A
- ✅ Real-time document processing

## ✨ Features

### Core Functionality
- **AI-Powered Loan Ingestion**: Upload PDFs with automated text extraction and intelligent analysis
- **Smart Document Analysis**: Gemini AI identifies sections, extracts metrics, and flags issues
- **Interactive Chatbot**: Ask questions about your documents and get instant answers
- **Smart Search**: Advanced search capabilities across loan portfolios
- **Version Control**: Track changes and amendments to loan agreements
- **Comparison Tools**: Side-by-side comparison of loan terms and conditions
- **API Integration**: RESTful API for seamless integration with existing systems
- **Analytics Dashboard**: Real-time insights into loan portfolio performance

### AI Features
- Browser-side PDF text extraction (no file size limits)
- Gemini 1.5 Flash integration for analysis
- Context-aware chatbot with document understanding
- Automatic section identification and summarization
- Key metrics extraction (principal, interest rate, term, covenants)
- Status indicators for risk assessment

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Icons**: Lucide React

### AI Integration
- **AI Model**: Google Gemini 1.5 Flash
- **PDF Processing**: PDF.js (Mozilla)
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- Gemini API key (get free at [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Getting Started

### 1. Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd edge-ledger-solutions-main

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### 3. Start Development Server

```sh
npm run dev
```

The application will be available at `http://localhost:8080` (or next available port).

### 4. Test the AI Features

1. Navigate to `/ingest` page
2. Upload a loan agreement PDF
3. Watch AI extract and analyze the document
4. Ask questions in the chatbot

## 📚 Documentation

### Quick Links
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 3 minutes
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - How to test the application
- **[FEATURES_IMPLEMENTED.md](./FEATURES_IMPLEMENTED.md)** - Complete feature list
- **[AI_IMPLEMENTATION_GUIDE.md](./AI_IMPLEMENTATION_GUIDE.md)** - Technical architecture
- **[SAMPLE_DOCUMENT.md](./SAMPLE_DOCUMENT.md)** - Sample loan agreement for testing

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
edge-ledger-solutions-main/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   └── ui/         # shadcn/ui components
│   ├── pages/          # Page components
│   │   ├── LoanIngest.tsx    # AI-powered document upload
│   │   ├── Dashboard.tsx     # Analytics dashboard
│   │   ├── LoansList.tsx     # Loan portfolio view
│   │   └── ...
│   ├── data/           # Mock data and fixtures
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── .env                # Environment variables (create this)
└── docs/               # Documentation files
```

## 🎯 Key Pages

### `/ingest` - AI Document Analysis
Upload loan agreements and get instant AI-powered analysis with:
- Automatic section extraction
- Key metrics dashboard
- Interactive chatbot
- Status indicators

### `/` - Dashboard
Overview of loan portfolio with analytics and insights

### `/loans` - Loan List
Browse and manage all loan records

### `/search` - Advanced Search
Search across loan portfolio with filters

### `/compare` - Comparison Tool
Side-by-side comparison of loan terms

### `/api` - API Documentation
RESTful API endpoints and integration guide

## 💡 Usage Examples

### Upload and Analyze a Document

1. Go to `/ingest`
2. Drag and drop a PDF or click "Select PDF File"
3. Wait for AI analysis (10-30 seconds)
4. Review extracted sections and metrics
5. Ask chatbot questions about the document

### Ask the AI Chatbot

Example questions:
- "What is the principal amount?"
- "Who are the parties to this agreement?"
- "What are the financial covenants?"
- "When does this loan mature?"
- "Are there any prepayment penalties?"

## 🔒 Security & Privacy

- ✅ PDFs processed locally in browser
- ✅ Only extracted text sent to AI API
- ✅ No file storage on external servers
- ✅ Secure HTTPS communication
- ✅ API keys stored in environment variables

## 💰 Cost Estimation

### Gemini API (Free Tier)
- 15 requests per minute
- 1 million tokens per minute
- Perfect for development and testing

### Paid Usage
- ~$0.001 per document analysis
- ~$0.0001 per chat message
- 1,000 documents/month ≈ $1-2

## 🐛 Troubleshooting

### Common Issues

**"Analysis failed" error**
- Check internet connection
- Verify API key in `.env` file
- Try a smaller PDF
- Ensure PDF contains text (not scanned images)

**No sections appearing**
- Verify PDF is text-based (not image-based)
- Check browser console for errors (F12)
- Try a different PDF

**Slow processing**
- Normal for large PDFs (50+ pages)
- Check internet speed
- Close other browser tabs

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed troubleshooting.

## 🚀 Deployment

### Build for Production

```sh
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Ensure these are set in production:
```env
VITE_GEMINI_API_KEY=your_production_api_key
```

## 🔮 Roadmap

### Planned Features
- [ ] Multi-document comparison
- [ ] Export to Excel/PDF
- [ ] Database integration
- [ ] User authentication
- [ ] Document versioning
- [ ] Advanced analytics
- [ ] Batch processing
- [ ] Mobile app

### AI Enhancements
- [ ] Risk scoring
- [ ] Clause recommendations
- [ ] Market benchmarking
- [ ] Predictive analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For issues, questions, or feedback:
1. Check the documentation files
2. Review the troubleshooting guide
3. Check browser console for errors
4. Create an issue in the repository

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2026

**Built with ❤️ for financial institutions**
