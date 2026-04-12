# Paddle - Store Launch Checklist

## Current Status (Apr 2026)
- **Store**: Application submitted Mar 27, 2026 — under review
- **Test mode webhook**: working and deployed (`/api/webhooks/paddle`)
- **Paddle env vars**: set on Vercel (`PADDLE_*`)
- **Legal pages**: `/terms` and `/privacy` created and deployed

---

## When Store Is Approved - Do These Steps:

### 1. Create LIVE Webhook
- Go to [Paddle Dashboard > Developer > Notifications](https://vendors.paddle.com/notifications)
- Switch to **Live mode** (not Sandbox!)
- Click "New destination"
- **URL**: `https://orin-summaries.vercel.app/api/webhooks/paddle`
- **Signing secret**: Paddle generates one for you — copy it
- **Events**: check `transaction.completed`
- Save

### 2. Update Vercel Environment Variables
```bash
# From the orin-summaries directory:
# Remove old LS vars (if still present):
npx vercel env rm LEMONSQUEEZY_WEBHOOK_SECRET production
npx vercel env rm LEMONSQUEEZY_API_KEY production

# Set Paddle vars:
npx vercel env rm PADDLE_WEBHOOK_SECRET production
npx vercel env add PADDLE_WEBHOOK_SECRET production
# Paste the signing secret from step 1

npx vercel env rm PADDLE_API_KEY production
npx vercel env add PADDLE_API_KEY production
# Paste your live API key from Paddle Dashboard > Developer > API Keys

npx vercel env rm NEXT_PUBLIC_PADDLE_CLIENT_TOKEN production
npx vercel env add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN production
# Paste your live client-side token from Paddle Dashboard > Developer > API Keys

npx vercel env rm NEXT_PUBLIC_PADDLE_ENVIRONMENT production
npx vercel env add NEXT_PUBLIC_PADDLE_ENVIRONMENT production
# Set to: production
```

### 3. Update Price ID
Check that `NEXT_PUBLIC_PADDLE_PRICE_ID` on Vercel matches the **live** price ID from Paddle Dashboard > Catalog > Prices.

The sandbox price ID is different from the live one.

### 4. Deploy
```bash
git push origin main
```
Vercel will auto-deploy. No code changes needed — the Paddle integration already reads env vars at runtime.

### 5. Test End-to-End
1. Open `orin-summaries.vercel.app` in incognito
2. Click "Buy Access" — should open Paddle checkout overlay
3. Use a real payment method (Paddle handles the transaction as merchant of record)
4. After payment:
   - You should be redirected to `/?activated=1`
   - Check Vercel logs: `npx vercel logs` — look for "Purchase stored for..."
5. Log out, then log back in with the same email — should have access

### 6. Verify Webhook Delivery
- Go to Paddle Dashboard > Developer > Notifications
- Click on the notification destination you created
- Check "Event log" — should show successful delivery (200 OK)
- If it shows errors, check Vercel function logs

---

## How the Purchase Flow Works
```
User clicks "Buy Access"
        |
        v
Paddle Checkout (overlay via Paddle.js)
        |
        v
    Payment successful
        |
        +---> Webhook (POST /api/webhooks/paddle)
        |         |
        |         v
        |     Verify HMAC-SHA256 signature
        |         |
        |         v
        |     Store purchase in Postgres (180 days)
        |
        +---> Redirect (GET /api/auth/activate?order_id=X)
                  |
                  v
              Verify order with Paddle API
                  |
                  v
              Store purchase (if not already stored by webhook)
                  |
                  v
              Set cookie + redirect to /?activated=1
```

Both paths store the purchase — the redirect is a fallback if the webhook is delayed.

---

## Environment Variables (All set on Vercel)
| Variable | Purpose |
|----------|---------|
| `PADDLE_WEBHOOK_SECRET` | Verify webhook signatures |
| `PADDLE_API_KEY` | Verify orders in activate endpoint |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle.js client-side SDK token |
| `NEXT_PUBLIC_PADDLE_PRICE_ID` | Product price ID for checkout |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | `sandbox` or `production` |
| `COOKIE_SECRET` | Sign auth cookies |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `ALLOWED_EMAILS` | Friends list (free access) |
| `GOOGLE_CLIENT_ID` | Google Sign-In |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Sign-In (client-side) |
| `KV_*` | Vercel KV connection (5 vars) |
| `DATABASE_URL` | Postgres (Neon) connection string |
