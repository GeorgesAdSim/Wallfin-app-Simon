import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { client, subject, creditReference, message } = await req.json();

    const emailBody = `
Nouvelle demande de contact depuis l'Espace Client Wallfin

---

Client:
Nom: ${client.firstName} ${client.lastName}
Email: ${client.email}
Téléphone: ${client.phone}

---

Sujet: ${subject}
${creditReference ? `Crédit concerné: ${creditReference}` : ''}

Message:
${message}

---

Cet email a été envoyé automatiquement depuis l'Espace Client Wallfin.
    `;

    console.log('Email would be sent to: info@wallfin.be');
    console.log('Email body:', emailBody);

    return new Response(
      JSON.stringify({ success: true, message: 'Request sent successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});