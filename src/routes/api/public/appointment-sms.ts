import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * POST /api/public/appointment-sms
 * Invia un SMS promemoria per un appuntamento via Twilio.
 *
 * Header richiesti:
 *   Authorization: Bearer <APPOINTMENT_SMS_API_KEY>
 *
 * Body JSON:
 *   { to, patientName, appointmentDate, appointmentTime?, message? }
 *
 * Variabili ambiente lato server:
 *   APPOINTMENT_SMS_API_KEY  — chiave per autenticare il chiamante
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */

const schema = z.object({
  to: z
    .string()
    .min(6)
    .max(20)
    .regex(/^\+?[0-9\s().-]+$/, "Numero di telefono non valido"),
  patientName: z.string().min(2).max(120),
  appointmentDate: z.string().min(4).max(40),
  appointmentTime: z.string().max(20).optional(),
  message: z.string().max(480).optional(),
});

function buildMessage(input: z.infer<typeof schema>) {
  if (input.message) return input.message;
  const when = input.appointmentTime
    ? `${input.appointmentDate} alle ${input.appointmentTime}`
    : input.appointmentDate;
  return `AURA Clinic — Gentile ${input.patientName}, le ricordiamo il suo appuntamento di ${when}. Per modifiche ci contatti.`;
}

export const Route = createFileRoute("/api/public/appointment-sms")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["APPOINTMENT_SMS_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Endpoint non configurato" }, { status: 503 });
        }
        const auth = request.headers.get("authorization");
        if (auth !== `Bearer ${apiKey}`) {
          return Response.json({ error: "Non autorizzato" }, { status: 401 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "JSON non valido" }, { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Dati non validi", details: parsed.error.flatten().fieldErrors },
            { status: 422 },
          );
        }

        const sid = process.env["TWILIO_ACCOUNT_SID"];
        const token = process.env["TWILIO_AUTH_TOKEN"];
        const from = process.env["TWILIO_FROM_NUMBER"];
        if (!sid || !token || !from) {
          return Response.json(
            { error: "Provider SMS non configurato (Twilio mancante)" },
            { status: 503 },
          );
        }

        const to = parsed.data.to.replace(/[\s().-]/g, "");
        const params = new URLSearchParams({
          To: to,
          From: from,
          Body: buildMessage(parsed.data),
        });

        try {
          const res = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
            },
          );
          const data = (await res.json()) as { sid?: string; message?: string };
          if (!res.ok) {
            return Response.json(
              { error: "Invio SMS fallito", provider: data.message ?? "errore sconosciuto" },
              { status: 502 },
            );
          }
          return Response.json({ ok: true, messageSid: data.sid });
        } catch (err) {
          return Response.json(
            { error: "Errore di rete verso il provider SMS", detail: String(err) },
            { status: 502 },
          );
        }
      },
    },
  },
});
