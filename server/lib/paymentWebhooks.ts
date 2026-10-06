/**
 * Payment Webhook Handler
 * Handles callbacks from Stripe and M-Pesa
 * 
 * Mount this router in the Express server BEFORE JSON middleware
 * Stripe needs raw body, so must be configured with express.raw()
 */

import { Express, Request, Response } from 'express';
import * as stripeService from '../services/stripe';
import * as mpesaService from '../services/mpesa';
import { TRPCError } from '@trpc/server';

/**
 * Setup webhook routes in Express app
 */
export function setupPaymentWebhooks(app: Express) {
  /**
   * Stripe webhook endpoint
   * POST /api/webhooks/stripe
   * 
   * Stripe sends raw JSON body, needs to be processed with signature verification
   * Use raw parser for this endpoint to capture raw body for signature verification
   */
  app.post(
    '/api/webhooks/stripe',
    // Use raw body parser ONLY for this endpoint to preserve raw bytes for signature verification
    (req: Request, res: Response, next: any) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk.toString();
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(data);
          (req as any).rawBody = data;
          next();
        } catch (error) {
          return res.status(400).json({ error: 'Invalid JSON in webhook body' });
        }
      });
    },
    async (req: Request, res: Response) => {
      try {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
          return res.status(400).json({ error: 'Missing stripe-signature header' });
        }

        // Stripe service handles signature verification
        const result = await stripeService.handleWebhookEvent(
          (req as any).rawBody,
          signature
        );

        console.log('[Webhook] Stripe event processed:', {
          eventType: result.eventType,
          invoiceId: result.invoiceId,
          processed: result.processed,
        });

        res.status(200).json({ received: true, processed: result.processed });
      } catch (error) {
        console.error('[Webhook] Stripe webhook error:', error);
        // Return 400 for signature failures, 500 for other errors
        if (error instanceof Error && error.message.includes('signature')) {
          return res.status(400).json({ error: 'Invalid signature' });
        }
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  );

  /**
   * M-Pesa callback endpoint
   * POST /api/webhooks/mpesa
   * 
   * M-Pesa sends JSON body with transaction confirmation
   */
  app.post('/api/webhooks/mpesa', async (req: Request, res: Response) => {
    try {
      const result = await mpesaService.handleCallback(req.body as mpesaService.MpesaCallbackPayload);

      console.log('[Webhook] M-Pesa callback processed:', {
        checkoutRequestId: result.checkoutRequestId,
        status: result.status,
      });

      // M-Pesa expects 200 OK response
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    } catch (error) {
      console.error('[Webhook] M-Pesa webhook error:', error);

      // Always return 200 to M-Pesa to avoid retries, but log error
      res.status(200).json({
        ResultCode: 1,
        ResultDesc: 'Error processing callback',
      });
    }
  });

  /**
   * M-Pesa validation endpoint (for test transactions)
   * POST /api/webhooks/mpesa-validation
   */
  app.post('/api/webhooks/mpesa-validation', (req: Request, res: Response) => {
    try {
      // M-Pesa validation request - always accept
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Validation successful',
      });
    } catch (error) {
      console.error('[Webhook] M-Pesa validation error:', error);
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Validation processed',
      });
    }
  });

  /**
   * Health check for webhook endpoints
   * GET /api/webhooks/health
   */
  app.get('/api/webhooks/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: {
        stripe: '/api/webhooks/stripe',
        mpesa: '/api/webhooks/mpesa',
        mpesaValidation: '/api/webhooks/mpesa-validation',
      },
    });
  });
}

export default setupPaymentWebhooks;
