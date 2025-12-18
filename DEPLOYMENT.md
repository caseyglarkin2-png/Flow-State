# Deployment Guide

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Production environment variables configured

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Generate a secure API key:
   ```bash
   openssl rand -base64 32
   ```

3. Update `.env.local` with your configuration:
   - Set `NODE_ENV=production`
   - Set `API_KEY` to your generated key
   - Configure MQTT broker URL and credentials
   - Set `INTERNAL_API_URL` to your production API URL

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Production Start

```bash
npm start
```

The application will be available at http://localhost:3000

## MQTT Worker (Optional)

If you need to ingest UWB telemetry data from MQTT:

```bash
npm run telemetry:worker
```

## Security Checklist

### ✅ Implemented

- [x] API key authentication (enabled in production)
- [x] Rate limiting (in-memory, per IP)
- [x] Input validation with Zod
- [x] File upload size limits (10MB)
- [x] File type validation (JPEG, PNG, WebP only)
- [x] Computational limits on genetic algorithm
- [x] MQTT message size limits
- [x] Environment variable validation
- [x] Health check endpoint

### 🔄 Recommended for Scale

- [ ] Replace in-memory rate limiting with Redis (@upstash/ratelimit)
- [ ] Replace in-memory telemetry store with Redis
- [ ] Add CORS configuration for specific origins
- [ ] Set up monitoring (e.g., Sentry for errors)
- [ ] Configure CSP headers
- [ ] Set up logging infrastructure
- [ ] Add request timeouts
- [ ] Configure reverse proxy (nginx/Caddy)
- [ ] Set up SSL/TLS certificates

## Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - Settings → Environment Variables
   - Add `API_KEY` and other required variables

## Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t flow-state .
docker run -p 3000:3000 --env-file .env.local flow-state
```

## Health Check

Check application health:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1703001234567,
  "version": "0.1.0",
  "services": {
    "api": "operational",
    "genesis": "operational",
    "telemetry": "operational"
  },
  "environment": "production"
}
```

## API Authentication

All API requests in production require authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/genesis/optimize
```

## Rate Limits

Default rate limits per IP:
- Genesis optimization: 10 requests/minute
- Frame upload: 20 requests/minute  
- Vision telemetry: 100 requests/minute
- UWB telemetry: 200 requests/minute
- Resolve: 100 requests/minute

## Monitoring

### Logs
Application logs are written to stdout. In production:
- Use a log aggregation service (Datadog, Logtail, etc.)
- Or pipe to a file: `npm start >> /var/log/flow-state.log 2>&1`

### Metrics
Consider adding:
- Request latency tracking
- Error rate monitoring
- Rate limit hit tracking
- Genetic algorithm performance metrics

## Troubleshooting

### "Invalid environment variables" error
- Check all required variables are set in `.env.local`
- Verify `API_KEY` is at least 32 characters

### Rate limit errors (429)
- Wait for the rate limit window to reset
- Or increase rate limits in the route files

### MQTT worker can't connect
- Verify MQTT broker URL is correct
- Check firewall rules
- Ensure credentials are correct
- For TLS, use `mqtts://` URL scheme

## Production Best Practices

1. **Never commit `.env.local` to git** (already in .gitignore)
2. **Use strong API keys** (32+ characters, cryptographically random)
3. **Enable HTTPS** via reverse proxy or platform (Vercel does this automatically)
4. **Monitor error rates** and set up alerts
5. **Regular security updates**: `npm audit` and update dependencies
6. **Backup strategy** for any persistent data
7. **Load testing** before production traffic
8. **Graceful shutdown** handling (already implemented in MQTT worker)

## Support

For issues or questions:
- Check [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for security considerations
- Review API route files for request/response formats
- Check build logs for errors
