import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function mondayGQL(token: string, query: string): Promise<any> {
  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
      "API-Version": "2024-10"
    },
    body: JSON.stringify({ query })
  });
  return res.json();
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { access_token, action, board_id, search_term, page } = await req.json();

    if (!access_token) {
      return new Response(JSON.stringify({ error: "Missing access_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const ok = (body: any) => new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

    // ── ACTION: list_boards ──────────────────────────────────────────
    // Trae TODOS los tableros de una sola vez (paginando internamente)
    if (action === 'list_boards') {
      const allBoards: any[] = [];
      for (let p = 1; p <= 5; p++) {
        const query = `query { boards (limit: 500, page: ${p}) { id name description items_count } }`;
        const data = await mondayGQL(access_token, query);
        const boards = data?.data?.boards || [];
        allBoards.push(...boards);
        if (boards.length < 500) break; // Ya no hay mas paginas
      }
      console.log("Total boards fetched:", allBoards.length);
      return ok({ status: 'success', boards: allBoards });
    }

    // ── ACTION: search_boards ────────────────────────────────────────
    // Busca tableros por nombre directamente en la API de Monday
    if (action === 'search_boards' && search_term) {
      // Monday no tiene un filtro de nombre en boards(), pero podemos hacer un workaround
      // trayendo todas las boards y filtrando en el backend
      const allBoards: any[] = [];
      for (let p = 1; p <= 5; p++) {
        const query = `query { boards (limit: 500, page: ${p}) { id name description items_count } }`;
        const data = await mondayGQL(access_token, query);
        const boards = data?.data?.boards || [];
        allBoards.push(...boards);
        if (boards.length < 500) break;
      }

      const term = search_term.toLowerCase();
      const filtered = allBoards.filter((b: any) => b.name.toLowerCase().includes(term));
      return ok({ status: 'success', boards: filtered, total: allBoards.length });
    }

    // ── ACTION: get_items ────────────────────────────────────────────
    if (action === 'get_items' && board_id) {
      // Intentar con items_page primero (API 2024-10)
      const query = `query {
        boards (ids: [${board_id}]) {
          name
          items_page (limit: 200) {
            items {
              id
              name
              group { title }
              column_values {
                id
                type
                text
                value
                column { title }
              }
              updates {
                id
                text_body
                created_at
              }
            }
          }
        }
      }`;

      const data = await mondayGQL(access_token, query);
      console.log("Items raw response:", JSON.stringify(data));
      
      const board = data?.data?.boards?.[0];
      let items = board?.items_page?.items || [];

      // Fallback: si items_page no devuelve nada, intentar con items()
      if (items.length === 0) {
        const fallbackQuery = `query {
          boards (ids: [${board_id}]) {
            name
            items (limit: 200) {
              id
              name
              group { title }
              column_values {
                id
                type
                text
                value
                column { title }
              }
              updates {
                id
                text_body
                created_at
              }
            }
          }
        }`;
        const fallbackData = await mondayGQL(access_token, fallbackQuery);
        console.log("Items fallback response:", JSON.stringify(fallbackData));
        const fallbackBoard = fallbackData?.data?.boards?.[0];
        items = fallbackBoard?.items || [];
      }

      return ok({
        status: 'success',
        board_name: board?.name || 'Unknown',
        items: items,
        _debug: data
      });
    }

    // ── ACTION: update_item ──────────────────────────────────────────
    if (action === 'update_item' && board_id && item_id && column_title && value !== undefined) {
      
      // Step 1: Encontrar el column_id correspondiente al column_title (ej: "ESP")
      const boardQuery = `query { boards (ids: [${board_id}]) { columns { id title type } } }`;
      const boardData = await mondayGQL(access_token, boardQuery);
      
      const columns = boardData?.data?.boards?.[0]?.columns || [];
      const targetColumn = columns.find((c: any) => c.title.trim().toLowerCase() === column_title.trim().toLowerCase());

      if (!targetColumn) {
        return new Response(JSON.stringify({ 
          error: `No se encontró una columna llamada "${column_title}" en este tablero. Asegúrate de que el nombre sea exacto.` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Step 2: Formatear el value segun el tipo (Monday a veces requiere JSON strings para numbers)
      const isNumber = targetColumn.type === 'numeric';
      // Para types como result, formula, no se puede mutar directamente con change_simple_column_value
      // Usar change_simple_column_value con el ID correcto
      const mutation = `mutation {
        change_simple_column_value(
          item_id: ${item_id},
          board_id: ${board_id},
          column_id: "${targetColumn.id}",
          value: "${value}"
        ) {
          id
        }
      }`;

      const updateData = await mondayGQL(access_token, mutation);
      
      if (updateData.errors) {
        throw new Error(JSON.stringify(updateData.errors));
      }

      return ok({ status: 'success', updated: updateData.data });
    }

    return ok({ error: "Invalid action. Use 'list_boards', 'search_boards', 'get_items', or 'update_item'" });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
