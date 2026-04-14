
import crypto from 'crypto';

interface BoldPaymentRequest {
    orderId: string;
    amount: number; // In cents or COP? Usually COP integers. Bold API expects integer amount.
    currency: 'COP';
    description: string;
    tax?: number;
    email: string;
}

interface BoldPaymentResponse {
    payment_link: string;
    transaction_id: string;
}

const BOLD_API_URL = process.env.BOLD_API_URL || 'https://integrations.bold.co/payment-exchange/v1';
const BOLD_API_KEY = process.env.BOLD_API_KEY;
const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY;
const BOLD_INTEGRITY_KEY = process.env.BOLD_INTEGRITY_KEY;

export class BoldPaymentService {

    private generateIntegritySignature(orderId: string, amount: number): string {
        if (!BOLD_INTEGRITY_KEY) {
            console.warn('BOLD_INTEGRITY_KEY is not defined');
            return '';
        }
        // Signature format depends on Bold docs. Usually concatenation of OrderID + Amount + Currency + Secret
        // Simplified SHA256 example. Real implementation needs specific Bold format.
        // Assuming: SHA256(orderId + amount + currency + secret)
        const rawString = `${orderId}${amount}COP${BOLD_INTEGRITY_KEY}`;
        return crypto.createHash('sha256').update(rawString).digest('hex');
    }

    async createPaymentLink(request: BoldPaymentRequest): Promise<BoldPaymentResponse> {
        if (!BOLD_API_KEY) {
            throw new Error('BOLD_API_KEY configuration missing');
        }

        // Integrity signature
        const signature = this.generateIntegritySignature(request.orderId, request.amount);

        const payload = {
            integrity_signature: signature,
            description: request.description,
            tax: request.tax || 0,
            amount: request.amount, // Ensure this is total including tax
            currency: request.currency,
            order_id: request.orderId,
            customer_data: {
                email: request.email
            },
            // Metadata or redirect URLs usually needed
            redirection_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment_status=success&order_id=${request.orderId}`,
            webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bold`,
            allowed_payment_methods: ["CARD", "PSE", "NEQUI"] // Example
        };

        try {
            const response = await fetch(`${BOLD_API_URL}/payment_links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `x-api-key ${BOLD_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Bold API Error:', errorData);
                throw new Error(`Bold API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Map response to our interface
            // Bold response might differ, adjusting based on common patterns
            return {
                payment_link: data.payload.url || data.url, // Adjust based on real response
                transaction_id: data.payload.payment_link_id || data.id
            };

        } catch (error) {
            console.error('Error creating Bold payment link:', error);
            throw error;
        }
    }
}

export const boldService = new BoldPaymentService();
