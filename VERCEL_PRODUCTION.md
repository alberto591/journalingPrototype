# TRAVESÍA — Vercel Production Deployment Guide

> **Canonical Production Host**: Vercel is the production web hosting platform for TRAVESÍA.
> All client routes and static assets are distributed globally via Vercel Edge Network.

---

## 1. Project Specifications

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | `20.x` or `22.x` |
| **Root Directory** | `./` |
| **Git Repository** | `https://github.com/alberto591/journalingPrototype.git` |
| **Production Branch** | `main` |

---

## 2. SPA Routing & Security Headers (`vercel.json`)

To prevent 404 errors on browser refresh (e.g. `travesia.app/journal` returning 404), `vercel.json` rewrites all route paths to `/index.html` while enforcing HTTP security headers:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 3. Environment Variables Separation

Configure in **Vercel Dashboard → Project Settings → Environment Variables**:

### Production Environment:
- `VITE_SUPABASE_URL`: Production Supabase project URL (`https://<production-id>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Production Supabase anonymous key
- `VITE_APP_URL`: `https://travesia.app`
- `VITE_BUSINESS_EXPERIMENT_MODE`: `true`

### Preview Environment (Pull Requests & Branches):
- `VITE_SUPABASE_URL`: Staging / Development Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Staging Supabase anonymous key
- `VITE_APP_URL`: System-generated preview URL (`https://<branch>-<project>.vercel.app`)

### Server-Only Secrets (Future Edge Functions / API routes):
- `SUPABASE_SERVICE_ROLE_KEY` *(NEVER prefix with `VITE_`)*
- `STRIPE_SECRET_KEY` *(Server only)*
- `ZOOM_CLIENT_SECRET` *(Server only)*

---

## 4. Production Domain Configuration

1. In Vercel Project Settings, navigate to **Domains**.
2. Add custom domain: `travesia.app` and `www.travesia.app`.
3. Configure DNS records at your domain registrar:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
4. Automatic SSL / TLS certificates are provisioned by Let's Encrypt through Vercel.

---

## 5. Deployment Workflow & CI/CD Pipeline

```
Local Development
      ↓
git commit & push to GitHub (branch: main)
      ↓
Vercel Automated Webhook Triggered
      ↓
Build Step: npm run build (tsc -b && vite build)
      ↓
Vercel Edge Network Deployment (Zero-Downtime Atomic Swap)
      ↓
Production Live: https://travesia.app
```

---

## 6. Rollback Procedure

If an unintended regression occurs in production:
1. Open **Vercel Dashboard → Deployments**.
2. Identify the last known stable deployment.
3. Click the **•••** (Options) icon next to that deployment and select **Instant Rollback (Promote to Production)**.
4. The atomic rollback activates instantly without needing a rebuild.

---

## 7. Observability & Health Check

- **Health Check Route**: `https://travesia.app/health` returns status code 200, frontend state, and Supabase connectivity.
- **Vercel Runtime Logs**: Monitor real-time client request latency, asset delivery, and HTTP status codes in **Vercel Dashboard → Analytics / Logs**.
