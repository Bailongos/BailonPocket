import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing authorization code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Usamos el ID de la app de Monday y el Secret almacenado en Supabase Vault
    const clientId = "b017b4b6f6ca8ec8b1c6d16e5f2c45f0";
    const clientSecret = Deno.env.get("MONDAY_CLIENT_SECRET");
    const safeRedirectUri = redirect_uri || "https://bailonpokect.netlify.app/";

    // 1. Intercambiar Autorization Code por Access Token
    const tokenResponse = await fetch("https://auth.monday.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: safeRedirectUri
      })
    });

    const oauthData = await tokenResponse.json();

    if (!tokenResponse.ok) {
       return new Response(JSON.stringify({ error: "Monday OAuth Error", details: oauthData }), {
         status: tokenResponse.status,
         headers: { ...corsHeaders, "Content-Type": "application/json" }
       });
    }
    
    // Aquí puedes retornar el accessToken temporalmente o guardarlo directamente 
    // en una tabla "arenas" de Supabase asociado al Room.
    
    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Token de acceso obtenido correctamente',
      data: oauthData 
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
