/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Erstellen eines eindeutigen Cache-Namens basierend auf der App-Version
const CACHE = `cache-${version}`;

// Ressourcen, die beim Installieren des Service Workers gecacht werden sollen
const ASSETS = [
  ...build, // Die Build-Dateien der App
  ...files  // Statische Dateien
];

// Installationsphase: Ressourcen im Cache speichern
self.addEventListener('install', (event) => {
  // @ts-expect-error - skipWaiting ist in der TypeScript-Definition nicht vorhanden
  self.skipWaiting();

  // @ts-expect-error - waitUntil ist in der TypeScript-Definition nicht vorhanden
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktivierungsphase: Alte Caches löschen
self.addEventListener('activate', (event) => {
  // @ts-expect-error - waitUntil ist in der TypeScript-Definition nicht vorhanden
  event.waitUntil(
    // @ts-expect-error - clients ist in der TypeScript-Definition nicht vorhanden
    self.clients.claim().then(() => {
      // Alte Caches löschen
      return caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE).map(key => caches.delete(key))
        );
      });
    })
  );
});

// Fetch-Event: Netzwerkanfragen abfangen
self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen behandeln
  // @ts-expect-error - request ist in der TypeScript-Definition nicht vorhanden
  if (event.request.method !== 'GET') return;

  // Anfragen an externe Domains ignorieren
  // @ts-expect-error - request ist in der TypeScript-Definition nicht vorhanden
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Strategie: Cache First, dann Netzwerk
  // @ts-expect-error - respondWith ist in der TypeScript-Definition nicht vorhanden
  event.respondWith(
    // @ts-expect-error - request ist in der TypeScript-Definition nicht vorhanden
    caches.match(event.request).then(cachedResponse => {
      // Wenn die Ressource im Cache gefunden wurde, gib sie zurück
      if (cachedResponse) {
        return cachedResponse;
      }

      // Ansonsten vom Netzwerk laden
      // @ts-expect-error - request ist in der TypeScript-Definition nicht vorhanden
      return fetch(event.request).then(response => {
        // Prüfen, ob die Antwort gültig ist
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Antwort klonen, da sie nur einmal gelesen werden kann
        const responseToCache = response.clone();

        // Antwort im Cache speichern
        caches.open(CACHE).then(cache => {
          // @ts-expect-error - request ist in der TypeScript-Definition nicht vorhanden
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// In einer vollständigen Implementierung würden hier noch weitere Event-Listener hinzugefügt:
// - push: Für Push-Benachrichtigungen
// - notificationclick: Für Klicks auf Benachrichtigungen
// - sync: Für Hintergrund-Synchronisation