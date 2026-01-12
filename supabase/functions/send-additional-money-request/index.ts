import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AdditionalMoneyRequestPayload {
  creditType: string;
  creditReference: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  comment: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: AdditionalMoneyRequestPayload = await req.json();
    const { creditType, creditReference, clientName, clientEmail, amount, comment } = payload;

    const emailBody = `
DEMANDE D'ARGENT SUPPLEMENTAIRE
================================

Client: ${clientName}
Email: ${clientEmail}

Credit concerne:
- Type: ${creditType}
- Reference: ${creditReference}

Montant supplementaire souhaite: ${formatCurrency(amount)}

Commentaire:
${comment || 'Aucun commentaire'}

================================
Envoye depuis l'Espace Client Wallfin
`;

    console.log('Additional money request email content:');
    console.log(emailBody);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demande envoyee avec succes',
        emailPreview: emailBody
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});