# NexLevel Speech - Production Launch Guide (2026)

## 🏗 Infrastructure Architecture

### High-Level Topology
```mermaid
graph TD
    User[End User] --> CF[Cloudflare (DNS/WAF)]
    CF --> Vercel[Frontend (Next.js Edge)]
    CF --> K8s[Backend (K8s Cluster)]
    
    subgraph "Kubernetes Cluster (AWS EKS)"
        Ingress[Nginx Ingress] --> Svc[Backend Service]
        Svc --> Pod1[NestJS Pod 1]
        Svc --> Pod2[NestJS Pod 2]
        Svc --> Pod3[NestJS Pod 3]
    end
    
    Pod1 --> DB[(PostgreSQL 16)]
    Pod1 --> Redis[(Redis Cache)]
    Pod1 --> S3[AWS S3 (Audio Storage)]
    Pod1 --> AI[ElevenLabs API]
    
    subgraph "Observability"
        Pod1 --> Logs[CloudWatch / Datadog]
    end
```

### Services
- **Frontend**: Hosted on Vercel for Edge Network performance (`saas.nexlevel.pk`).
- **Backend**: Hosted on Managed K8s (EKS/GKE) for scalability (`api.nexlevel.pk`).
- **Database**: Managed PostgreSQL (RDS) with Multi-AZ.
- **Cache**: Managed Redis (ElastiCache).

---

## 💰 AI Cost Control Strategy (CRITICAL)
*To prevent bankruptcy from API abuse.*

### 1. Hard Limits (Code Enforcement)
- **Rate Limits**: 5 requests / min per user for TTS.
- **Character Caps**: 
  - Free: 5,000 chars/mo
  - Pro: 50,000 chars/mo
  - *Enforced by `CreditService` before API call.*

### 2. Kill Switches (Env Vars)
Set these in your K8s ConfigMap/Secrets to instantly stop bleeding:
- **`AI_GENERATION_ENABLED=false`** (Stops all TTS)
- **`FREE_TIER_ENABLED=false`** (Paywall only)
- **`MAX_DAILY_SPEND_USD=100`** (Requires backend logic implementation, recommend checking daily)

### 3. Budget Alerts
- Setup **AWS Budgets** or **ElevenLabs Usage Limits**.
- **Action**: Webhook to PagerDuty/Slack if spend > $50/day.

---

## 🛡️ Security Checklist (Launch Ready)

### Infrastructure
- [ ] **Cloudflare WAF**: Block non-PK/Global high-risk IPs.
- [ ] **DDoS Protection**: Enable Under Attack Mode if needed.
- [ ] **Private VPC**: DB and Redis should NOT be public.

### Backend
- [ ] **Secrets**: Rotate `JWT_SECRET` and `ELEVENLABS_API_KEY`. Use K8s Secrets.
- [ ] **Rate Limiting**: Enabled `@nestjs/throttler` (Global + Auth endpoints).
- [ ] **Input Validation**: All DTOs validated with `class-validator`.

### Frontend
- [ ] **CSP Headers**: set `Content-Security-Policy`.
- [ ] **Auth Cookie**: `HttpOnly`, `Secure`, `SameSite=Strict`.

---

## 📊 Observability & Monitoring

### Logging (JSON)
- Backend configured to output JSON logs.
- Ingest into **Datadog**, **New Relic**, or **ELK Stack**.
- **Trace ID**: Passed from Frontend -> Backend for debugging.

### Metrics to Watch
1. **TTS Latency**: P95 should be < 2s for streaming start.
2. **Error Rate**: Alert if > 1%.
3. **Credit Consumption**: Spike detection = Potential Abuse.

---

## 🚀 Rollout Plan
1. **Smoketest**: Deploy to Staging, run E2E flow (Login -> Pay -> Generate).
2. **Database Migration**: `npx prisma migrate deploy`.
3. **Deploy Backend**: Apply K8s manifests.
4. **Deploy Frontend**: Push to Vercel (Main branch).
5. **DNS**: Point `api.nexlevel.pk` to K8s Ingress IP.

*Prepared by DevOps Lead - 2026*
