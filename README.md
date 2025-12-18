# Flow State by FreightRoll

**From turbulence to throughput.** Yard management reimagined with genetic algorithms and sensor fusion.

🚀 **Live and Production-Ready**

## Features

### 🧬 Project Genesis
Genetic layout optimization that scores yard designs using Reynolds Number to minimize operational viscosity. Automatically generates optimal dock, staging, and office layouts under constraints.

### 📡 Telemetry Pipeline
Real-time asset tracking with vision + UWB sensor fusion. Resolves positions using confidence-weighted algorithms for accurate yard telemetry.

### 🔒 Production-Ready Security
- API key authentication
- Rate limiting (configurable per endpoint)
- Input validation with Zod
- File upload restrictions
- Computational limits on algorithms

## Quick Start

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

## API Endpoints

All API endpoints require authentication in production via `Authorization: Bearer YOUR_API_KEY` header.

### Genesis Optimization
```bash
POST /api/genesis/optimize
```
Run genetic algorithm to optimize yard layout.

### Telemetry Ingestion
```bash
POST /api/telemetry/ingest/vision  # Camera detections
POST /api/telemetry/ingest/uwb     # UWB positioning
POST /api/frame/ingest              # Frame capture
```

### Sensor Fusion
```bash
POST /api/telemetry/resolve        # Combine vision + UWB data
```

### Health Check
```bash
GET /api/health                     # Application health status
```

## Rate Limits

Default limits per IP address:
- Genesis: 10 req/min (CPU-intensive)
- Frame upload: 20 req/min
- Vision telemetry: 100 req/min
- UWB telemetry: 200 req/min
- Resolve: 100 req/min

## Architecture

```
src/
├── app/
│   ├── api/              # API routes with auth & rate limiting
│   ├── genesis/          # Genesis UI page
│   └── page.tsx          # Home page
├── components/           # Reusable React components
└── lib/
    ├── genesis/          # Genetic algorithm logic
    ├── telemetry/        # Sensor fusion & storage
    ├── auth.ts           # Authentication middleware
    ├── rate-limit.ts     # Rate limiting logic
    └── env.ts            # Environment validation
```

## Development Tools

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run telemetry:worker  # Start MQTT worker
```

## Security

- ✅ Zero npm vulnerabilities
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent DoS
- ✅ File upload restrictions
- ✅ Computational limits on algorithms
- ✅ Environment variable validation

See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for detailed security analysis.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Telemetry**: MQTT + Custom sensor fusion
- **Optimization**: Custom genetic algorithm

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [SECURITY_REVIEW.md](SECURITY_REVIEW.md) - Security analysis and recommendations

## License

Private project - All rights reserved
