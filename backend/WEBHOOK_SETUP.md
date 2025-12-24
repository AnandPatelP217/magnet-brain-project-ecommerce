# Stripe Webhook Implementation

## Overview
This document explains how Stripe webhooks are implemented to automatically update order statuses based on payment events.

## Webhook Endpoint
**URL**: `POST /api/orders/webhook`

This endpoint receives events from Stripe and updates order statuses accordingly.

## Configuration

### 1. Environment Variables
Add the following to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_EPZ9KYH9GMjkwPdSEpLX4maOITkUHo8Z
```

### 2. Stripe Dashboard Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/orders/webhook`
4. Select events to listen for (or select all):
   - `payment_intent.created`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
   - `charge.succeeded`
   - `charge.failed`
   - `charge.refunded`
5. Copy the webhook signing secret and add it to your `.env` file

## Webhook Events Handled

### Payment Intent Events

| Event | Description | Order Status Updates |
|-------|-------------|---------------------|
| `payment_intent.created` | Payment intent is created | `paymentStatus`: `created` |
| `payment_intent.processing` | Payment is being processed | `paymentStatus`: `authorized` |
| `payment_intent.succeeded` | Payment succeeded | `paymentStatus`: `captured`<br>`orderStatus`: `processing` |
| `payment_intent.payment_failed` | Payment failed | `paymentStatus`: `failed`<br>`orderStatus`: `cancelled` |
| `payment_intent.canceled` | Payment was canceled | `paymentStatus`: `cancelled`<br>`orderStatus`: `cancelled` |

### Charge Events

| Event | Description | Order Status Updates |
|-------|-------------|---------------------|
| `charge.succeeded` | Charge was successful | `paymentStatus`: `captured`<br>`orderStatus`: `processing` |
| `charge.failed` | Charge failed | `paymentStatus`: `failed`<br>`orderStatus`: `cancelled` |
| `charge.refunded` | Charge was refunded | `paymentStatus`: `cancelled`<br>`orderStatus`: `cancelled` |

## Order Status Flow

```
Order Created → Payment Intent Created
     ↓
Payment Processing → payment_intent.processing
     ↓
Payment Succeeded → payment_intent.succeeded
     ↓
Order Processing (paymentStatus: captured, orderStatus: processing)
```

## Testing Webhooks Locally

### Using Stripe CLI

1. **Install Stripe CLI**:
   - Download from: https://stripe.com/docs/stripe-cli
   - Or use chocolatey: `choco install stripe`

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local endpoint**:
   ```bash
   stripe listen --forward-to localhost:5000/api/orders/webhook
   ```

4. **Copy the webhook signing secret** displayed and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

5. **Trigger test events**:
   ```bash
   # Test successful payment
   stripe trigger payment_intent.succeeded

   # Test failed payment
   stripe trigger payment_intent.payment_failed

   # Test canceled payment
   stripe trigger payment_intent.canceled
   ```

### Using ngrok (Alternative)

1. **Install ngrok**: https://ngrok.com/download

2. **Start your server**:
   ```bash
   npm start
   ```

3. **Create tunnel**:
   ```bash
   ngrok http 5000
   ```

4. **Configure Stripe webhook**:
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Add webhook endpoint in Stripe Dashboard: `https://abc123.ngrok.io/api/orders/webhook`
   - Copy the webhook secret to your `.env` file

## Security

### Webhook Signature Verification
All webhook requests are verified using Stripe's signature verification:

1. Stripe sends a `stripe-signature` header with each webhook request
2. The server verifies the signature using the webhook secret
3. Invalid signatures are rejected with a 400 error

### Implementation
```javascript
const event = stripeService.verifyWebhookSignature(
    req.body,          // Raw body (important!)
    sig,               // Stripe signature from header
    STRIPE_WEBHOOK_SECRET
);
```

⚠️ **Important**: The webhook route must receive the **raw body** for signature verification. This is why the webhook route is registered before the `express.json()` middleware in `app.js`.

## Error Handling

- **Invalid signature**: Returns 400 with error message
- **Order not found**: Logs error but returns 200 to Stripe (prevents retries)
- **Other errors**: Logs error but returns 200 to Stripe (prevents retries)

## Monitoring

Check your server logs for webhook events:
```
Received webhook event: payment_intent.succeeded
Payment Intent Succeeded: pi_xxx...
Order 123abc payment captured and moved to processing
```

## Troubleshooting

### Webhooks not working?

1. **Check webhook secret**: Ensure `STRIPE_WEBHOOK_SECRET` is correct in `.env`
2. **Check raw body**: Verify webhook route is before `express.json()` middleware
3. **Check Stripe Dashboard**: View webhook logs in Stripe Dashboard → Developers → Webhooks → Select your endpoint
4. **Check server logs**: Look for webhook-related errors in console
5. **Test locally**: Use Stripe CLI to trigger test events

### Common Issues

- **Signature verification failed**: Wrong webhook secret or body is not raw
- **Webhook timing out**: Processing is taking too long (>30s)
- **Orders not updating**: Check if order exists with the given `stripePaymentIntentId`

## API Response

Successful webhook processing:
```json
{
  "received": true
}
```

## Files Modified

- **src/controllers/webhook.controller.js** - New webhook controller
- **src/routes/order.route.js** - Added webhook route with raw body parsing
- **src/app.js** - Reorganized middleware order for webhook support
- **.env.example** - Added webhook secret configuration

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
