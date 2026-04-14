
import { NextRequest, NextResponse } from 'next/server';
import { boldService } from '@/lib/bold';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { projectId, quotationId } = await request.json();

        // Validate inputs
        if (!projectId && !quotationId) {
            return NextResponse.json({ error: 'Project ID or Quotation ID is required' }, { status: 400 });
        }

        const supabase = await createClient();
        let amount = 0;
        let description = '';
        let userEmail = '';
        let userId = '';

        // Fetch details based on context (Project deposit or Full Quotation)
        if (quotationId) {
            const { data: quoteData, error } = await supabase
                .from('quotations')
                .select('*, user:users(id, email)')
                .eq('id', quotationId)
                .single();

            if (error || !quoteData) throw new Error('Quotation not found');
            const quote = quoteData as any;

            amount = quote.total;
            description = `Pago de Cotización #${quote.number}`;
            userEmail = quote.user?.email || '';
            userId = quote.user?.id || '';
        } else if (projectId) {
            const { data: projectData, error } = await supabase
                .from('projects')
                .select('*, user:users(id, email)')
                .eq('id', projectId)
                .single();

            if (error || !projectData) throw new Error('Project not found');
            const project = projectData as any;

            // Logic for Deposit (e.g., 50%)
            amount = (project.budget || 0) * 0.5;
            description = `Anticipo Proyecto: ${project.title}`;
            userEmail = project.user?.email || '';
            userId = project.user?.id || '';
        }

        if (amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Create Order record (pending)
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Using Bold Service
        const paymentResponse = await boldService.createPaymentLink({
            orderId: orderId,
            amount: Math.round(amount), // Ensure integer
            currency: 'COP',
            description: description,
            email: userEmail,
            tax: 0 // Simplification
        });

        // Save Order in DB
        const { error: orderError } = await (supabase
            .from('orders') as any) // Cast builder to any to bypass strict insert types
            .insert({
                orderNumber: orderId,
                total: amount,
                subtotal: amount,
                tax: 0,
                status: 'PENDING',
                userId: userId,
                projectId: projectId || null,
                quotationId: quotationId || null,
                notes: description
            });

        if (orderError) {
            console.error('Error saving order:', orderError);
        }

        return NextResponse.json({
            paymentUrl: paymentResponse.payment_link,
            transactionId: paymentResponse.transaction_id
        });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
