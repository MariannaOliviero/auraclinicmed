// Service Worker AURA Clinic — versione minimale e sicura.
//
// Scopo: rendere il sito "installabile" (requisito tecnico di Chrome/Edge/Android)
// e mettere in cache solo l'involucro statico dell'app (icone, manifest).
//
// Scelta deliberata: NON mettiamo in cache le pagine né le chiamate a Supabase.
// In un gestionale con dati reali (appuntamenti, pazienti) mostrare dati vecchi
// dalla cache sarebbe un rischio serio, quindi tutto il resto passa sempre dalla rete.

const CACHE_NAME = "aura-shell-v1";
const SHELL_ASSETS = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network-first per tutto: se la rete c'è, si usa sempre quella (dati sempre freschi).
// La cache serve solo come fallback per le poche risorse statiche elencate sopra,
// utile se la connessione cade per un istante.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached ?? Response.error())),
  );
});
