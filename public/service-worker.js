this.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  // Perform install steps
});

this.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

this.addEventListener('fetch', function(event) {
  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
