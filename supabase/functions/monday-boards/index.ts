import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { access_token, action, board_id } = await req.json();

    if (!access_token) {
      return new Response(JSON.stringify({ error: "Missing access_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── ACTION: list_boards ──────────────────────────────────────────
    // Retorna la lista de tableros del usuario para que elija cuál estimar
    if (action === 'list_boards') {
      const query = `query { boards (limit: 200, board_kind: public_board) { id name description items_count } }`;

      const res = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": access_token,
          "API-Version": "2024-10"
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      console.log("Monday API boards response:", JSON.stringify(data));

      return new Response(JSON.stringify({
        status: 'success',
        boards: data?.data?.boards || [],
        _debug: data  // Include raw response for debugging
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── ACTION: get_items ────────────────────────────────────────────
    // Retorna los items (tickets) de un tablero específico
    if (action === 'get_items' && board_id) {
      const query = `query {
        boards (ids: [${board_id}]) {
          name
          items_page (limit: 100) {
            items {
              id
              name
              group { title }
              column_values { id title text }
            }
          }
        }
      }`;

      const res = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": access_token,
          "API-Version": "2024-10"
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      const board = data?.data?.boards?.[0];

      return new Response(JSON.stringify({
        status: 'success',
        board_name: board?.name || 'Unknown',
        items: board?.items_page?.items || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'list_boards' or 'get_items'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
