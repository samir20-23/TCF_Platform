import { config } from '../config';

const { clientId, clientSecret, mode } = config.paypal;
const BASE_URL = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export interface CreatePayPalOrderParams {
    planId: string;
    planName: string;
    priceCents: number;
    userId: string;
    successUrl?: string;
    cancelUrl?: string;
    currency?: string;
}

async function getAccessToken() {
    if (!clientId || !clientSecret) {
        throw new Error('PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    try {
        const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${auth}`,
            },
            body: 'grant_type=client_credentials',
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('PayPal Auth Error:', {
                status: response.status,
                statusText: response.statusText,
                error: data
            });
            throw new Error(data.error_description || 'Failed to get PayPal access token');
        }

        return data.access_token;
    } catch (error) {
        console.error('PayPal Auth Exception:', error);
        throw error;
    }
}

export async function createPayPalOrder({
    planId,
    planName,
    priceCents,
    userId,
    successUrl,
    cancelUrl,
    currency = 'USD'
}: CreatePayPalOrderParams) {
    const accessToken = await getAccessToken();

    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: currency.toUpperCase(),
                    value: (priceCents / 100).toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: currency.toUpperCase(),
                            value: (priceCents / 100).toFixed(2),
                        }
                    }
                },
                description: planName,
                custom_id: `${userId}|${planId}`, // Metadata
                items: [
                    {
                        name: planName,
                        unit_amount: {
                            currency_code: currency.toUpperCase(),
                            value: (priceCents / 100).toFixed(2),
                        },
                        quantity: '1',
                        category: 'DIGITAL_GOODS'
                    }
                ]
            },
        ],
        application_context: {
            return_url: successUrl || `${config.app.siteUrl}/student-dashboard?checkout=success`,
            cancel_url: cancelUrl || `${config.app.siteUrl}/pricing-plans?checkout=canceled`,
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
        },
    };

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'PayPal-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('PayPal Create Order Error:', {
            status: response.status,
            statusText: response.statusText,
            debug_id: response.headers.get('paypal-debug-id'),
            error: data
        });

        // Extract specific error details if available
        const details = data.details?.map((d: any) => `${d.issue}: ${d.description}`).join(', ');
        throw new Error(details || data.message || 'Failed to create PayPal order');
    }

    // Find approval URL
    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

    return {
        id: data.id,
        url: approvalUrl,
    };
}

export async function capturePayPalOrder(orderId: string) {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'PayPal-Request-Id': crypto.randomUUID(),
        },
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('PayPal Capture Order Error:', {
            status: response.status,
            statusText: response.statusText,
            debug_id: response.headers.get('paypal-debug-id'),
            error: data
        });

        const details = data.details?.map((d: any) => `${d.issue}: ${d.description}`).join(', ');
        throw new Error(details || data.message || 'Failed to capture PayPal order');
    }

    return data;
}
