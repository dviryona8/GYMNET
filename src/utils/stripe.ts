/**
 * GYMNET Stripe Integration (Test Mode)
 *
 * To enable real Stripe payments:
 * 1. Replace STRIPE_PUBLISHABLE_KEY with your real Stripe publishable key (pk_test_...)
 * 2. Replace STRIPE_PRICE_IDS with your real Stripe Price IDs from the Stripe Dashboard
 * 3. Create a backend endpoint to create Checkout Sessions and replace simulateCheckout()
 *
 * See: https://stripe.com/docs/checkout/quickstart
 */

// Replace with your Stripe publishable key (test mode: pk_test_...)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';

// Replace with your Stripe Price IDs (create in Stripe Dashboard → Products)
export const STRIPE_PRICE_IDS: Record<string, string> = {
  single:  'price_SINGLE_TEST_ID',
  monthly: 'price_MONTHLY_TEST_ID',
  yearly:  'price_YEARLY_TEST_ID',
};

/**
 * Simulates a Stripe Checkout redirect for demo purposes.
 * In production, call your backend to create a Checkout Session,
 * then redirect to session.url.
 */
export async function simulateCheckout(planId: string, successUrl: string, _cancelUrl: string): Promise<void> {
  // Demo: wait 1s then redirect to success page
  await new Promise(res => setTimeout(res, 1000));
  window.location.href = successUrl;
}
