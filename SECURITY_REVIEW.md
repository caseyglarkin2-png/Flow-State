# Security and Code Review

**Date:** December 18, 2025  
**Branch:** `copilot/add-yard-layout-typings`  
**Status:** ✅ Build Successful | 🔒 Security Review Complete

---

## Summary

The codebase has been reviewed for security vulnerabilities, code quality issues, and best practices. Overall, the implementation is solid with good use of TypeScript, Zod validation, and modern Next.js patterns. However, there are important production considerations that should be addressed before deployment.

---

## ✅ Strengths

### 1. **Strong Input Validation**
- All API routes use Zod schemas for comprehensive input validation
- Type safety enforced throughout with TypeScript
- Proper error handling with descriptive error messages

### 2. **Zero Known Vulnerabilities**
- `npm audit` shows 0 vulnerabilities
- All dependencies are recent and well-maintained
- Using latest stable versions of Next.js (16.0.10) and React (19.2.1)

### 3. **Clean Architecture**
- Well-organized folder structure
- Separation of concerns (API routes, components, lib utilities)
- Reusable components and type definitions

### 4. **Successful Build**
- TypeScript compilation succeeds with no errors
- All routes properly configured
- Static and dynamic rendering correctly identified

---

## ⚠️ Security Considerations for Production

### 1. **Rate Limiting (HIGH PRIORITY)**

**Issue:** API routes have no rate limiting, making them vulnerable to:
- Denial of Service (DoS) attacks
- Resource exhaustion
- Abuse of compute-intensive operations (genetic algorithm)

**Affected Routes:**
- `/api/genesis/optimize` - CPU-intensive genetic algorithm
- `/api/frame/ingest` - File upload endpoint
- `/api/telemetry/ingest/*` - Data ingestion endpoints

**Recommendation:**
```typescript
// Add Next.js middleware for rate limiting
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

### 2. **Authentication/Authorization (HIGH PRIORITY)**

**Issue:** All API endpoints are publicly accessible with no authentication.

**Recommendations:**
- Add API key authentication for production endpoints
- Implement NextAuth.js or similar for user authentication
- Use middleware to protect sensitive routes
- Consider IP whitelisting for internal services (MQTT worker)

**Example:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export const config = {
  matcher: '/api/:path*',
}
```

### 3. **File Upload Security (MEDIUM PRIORITY)**

**Location:** `src/app/api/frame/ingest/route.ts`

**Issues:**
- No file size limit enforcement
- No file type validation beyond form field check
- No malware scanning
- Files are loaded entirely into memory

**Recommendations:**
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

if (img.size > MAX_FILE_SIZE) {
  return NextResponse.json({ error: 'File too large' }, { status: 413 });
}

if (!ALLOWED_MIME_TYPES.includes(img.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

### 4. **In-Memory Storage (MEDIUM PRIORITY)**

**Location:** `src/lib/telemetry/store.ts`

**Issue:** Using Map for storage means:
- Data loss on server restart
- Memory leaks with unbounded growth
- No horizontal scaling possible
- No data persistence

**Recommendation:**
```typescript
// Use Redis or similar for production
import { Redis } from '@upstash/redis'

class TelemetryStoreImpl {
  private redis = Redis.fromEnv()
  
  async putVision(key: string, data: VisionDetection) {
    await this.redis.setex(`vision:${key}`, 3600, JSON.stringify(data))
  }
  
  // Add TTL to prevent unbounded growth
  // Add batch operations for performance
}
```

### 5. **MQTT Worker Security (MEDIUM PRIORITY)**

**Location:** `scripts/uwb-mqtt-worker.ts`

**Issues:**
- Credentials in environment variables (acceptable but needs docs)
- No TLS/SSL for MQTT connection
- No message size limits
- No reconnection strategy with backoff

**Recommendations:**
```typescript
const MQTT_URL = process.env.MQTT_URL || "mqtts://localhost:8883"; // Use TLS

const client = mqtt.connect(MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  ca: fs.readFileSync(process.env.MQTT_CA_CERT!),
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
});

// Add message size validation
if (message.length > 1024 * 1024) { // 1MB
  console.warn('Message too large, skipping');
  return;
}
```

### 6. **Genetic Algorithm DoS Prevention (MEDIUM PRIORITY)**

**Location:** `src/lib/genesis/LayoutOptimizer.ts`

**Issue:** No upper bounds on computational parameters could lead to DoS.

**Current validation:**
```typescript
population: z.number().int().positive().optional(),
generations: z.number().int().positive().optional(),
```

**Recommendation:**
```typescript
const MAX_POPULATION = 200;
const MAX_GENERATIONS = 500;

population: z.number().int().positive().max(MAX_POPULATION).optional(),
generations: z.number().int().positive().max(MAX_GENERATIONS).optional(),

// Also add timeout for optimization
const TIMEOUT_MS = 30000; // 30 seconds
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Optimization timeout')), TIMEOUT_MS)
);
```

---

## 💡 Code Quality Improvements

### 1. **Error Handling Enhancement**

Add structured logging:
```typescript
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    // ... existing code
  } catch (error) {
    logger.error('Genesis optimization failed', { error, timestamp: Date.now() })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 2. **Environment Variable Validation**

Create `src/lib/env.ts`:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  MQTT_URL: z.string().url().optional(),
  API_KEY: z.string().min(32),
  REDIS_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

### 3. **API Response Standardization**

```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }
```

### 4. **Add Health Check Endpoint**

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: process.env.npm_package_version,
    services: {
      telemetry: 'operational',
      genesis: 'operational',
    }
  })
}
```

---

## 📋 Testing Recommendations

### 1. **Unit Tests Needed**
- `LayoutOptimizer.ts` - genetic algorithm logic
- `TelemetryResolver.ts` - sensor fusion logic
- All Zod schemas

### 2. **Integration Tests Needed**
- API route handlers
- MQTT worker message processing
- Error scenarios

### 3. **Load Testing**
- Genesis optimization under load
- Telemetry ingestion throughput
- File upload limits

---

## 🚀 Deployment Checklist

- [ ] Add rate limiting middleware
- [ ] Implement authentication
- [ ] Replace in-memory store with Redis
- [ ] Add file upload validation and limits
- [ ] Set up HTTPS/TLS for MQTT
- [ ] Add computational limits to genetic algorithm
- [ ] Configure CORS policies
- [ ] Set up monitoring and alerting
- [ ] Add structured logging
- [ ] Create environment variable documentation
- [ ] Set up CI/CD security scanning
- [ ] Add health check endpoints
- [ ] Implement graceful shutdown handlers
- [ ] Configure CSP headers
- [ ] Set up backup strategy for telemetry data

---

## 🎯 Priority Matrix

| Priority | Category | Item | Effort |
|----------|----------|------|--------|
| 🔴 HIGH | Security | Rate Limiting | Medium |
| 🔴 HIGH | Security | Authentication | High |
| 🟡 MEDIUM | Security | File Upload Validation | Low |
| 🟡 MEDIUM | Architecture | Redis/Persistent Storage | Medium |
| 🟡 MEDIUM | Security | MQTT TLS + Auth | Medium |
| 🟡 MEDIUM | Security | Computational Limits | Low |
| 🟢 LOW | Quality | Structured Logging | Low |
| 🟢 LOW | Quality | Health Checks | Low |

---

## ✅ Conclusion

The code is **production-ready from a functional standpoint** but requires security hardening before public deployment. The implementation demonstrates strong engineering practices with excellent type safety and input validation. 

**Immediate Action Items:**
1. Add rate limiting (critical for public APIs)
2. Implement authentication (critical for sensitive data)
3. Replace in-memory storage with persistent solution
4. Add file upload restrictions

Once these items are addressed, the application will be ready for production deployment.
