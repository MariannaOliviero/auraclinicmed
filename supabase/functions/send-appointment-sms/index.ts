// Edge Function: send-appointment-sms
//
// Invia un SMS reale (Twilio) di "promemoria" o "conferma" per un appuntamento,
// e registra l'esito in public.sms_log + aggiorna appointments.reminder_sent_at /
// appointments.confirmation_sent_at.
//
// Richiede questi secrets configurati sul progetto Supabase (Dashboard > Edge Functions > Secrets,
// oppure via CLI: `supabase secrets set NOME=valore`):
//   TWILIO_ACCOUNT_SID   -> Account SID Twilio
//   TWILIO_AUTH_TOKEN    -> Auth Token Twilio
//   TWILIO_FROM_NUMBER   -> numero mittente Twilio in formato E.164 (es. +390212345678)
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili automaticamente
// nell'ambiente delle Edge Functions, non vanno impostati a mano.
//
// Chiamata dal client (solo utenti staff autenticati, verify_jwt=true):
//   supabase.functions.invoke('send-appointment-sms', {
//     body: { appointment_id: '...', kind: 'reminder' | 'confirmation' }
//   })

import { createClient } from "jsr:@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildMessage(
  kind: "reminder" | "confirmation",
  patientName: string,
  title: string,
  startsAt: string,
) {
  const when = new Date(startsAt).toLocaleString("it-IT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  });
  if (kind === "confirmation") {
    return `Ciao ${patientName}, confermiamo il tuo appuntamento "${title}" per ${when}. A presto!`;
  }
  return `Ciao ${patientName}, ti ricordiamo il tuo appuntamento "${title}" per ${when}. Se devi disdire o spostare, contattaci al più presto.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      return new Response(
        JSON.stringify({
          error:
            "SMS non configurato: mancano i secrets TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER sul progetto Supabase.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autenticato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client "as user" per verificare che chi chiama sia davvero staff.
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Sessione non valida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client con service role per leggere/scrivere bypassando la RLS in modo controllato.
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: isStaff } = await admin.rpc("is_staff", { _user_id: userData.user.id });
    if (!isStaff) {
      return new Response(JSON.stringify({ error: "Operazione riservata allo staff" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { appointment_id, kind } = await req.json();
    if (!appointment_id || (kind !== "reminder" && kind !== "confirmation")) {
      return new Response(
        JSON.stringify({ error: "Parametri non validi (appointment_id, kind)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: appt, error: apptError } = await admin
      .from("appointments")
      .select("id, title, starts_at, patients(first_name, last_name, phone)")
      .eq("id", appointment_id)
      .single();

    if (apptError || !appt) {
      return new Response(JSON.stringify({ error: "Appuntamento non trovato" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const patient = appt.patients as {
      first_name: string;
      last_name: string;
      phone: string | null;
    } | null;
    if (!patient?.phone) {
      return new Response(
        JSON.stringify({ error: "Il paziente non ha un numero di telefono salvato" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = buildMessage(kind, patient.first_name, appt.title, appt.starts_at);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: patient.phone,
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }),
    });

    const twilioJson = await twilioRes.json();
    const success = twilioRes.ok;

    await admin.from("sms_log").insert({
      appointment_id,
      kind,
      phone: patient.phone,
      status: success ? "inviato" : "errore",
      provider_response: JSON.stringify(twilioJson).slice(0, 2000),
      sent_by: userData.user.id,
    });

    if (success) {
      const column = kind === "reminder" ? "reminder_sent_at" : "confirmation_sent_at";
      await admin
        .from("appointments")
        .update({ [column]: new Date().toISOString() })
        .eq("id", appointment_id);
    }

    return new Response(JSON.stringify({ success, twilio: twilioJson }), {
      status: success ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Errore interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
