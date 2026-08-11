/* domina/docs/sw.js

classic script on purpose — a service worker has no import map, so bare specifiers
never resolve there. importScripts() performs no specifier resolution at all and
is how a worker shares code. see aufbau/sw.js for the reasoning in full.

register WITHOUT type: 'module'.
*/

importScripts('https://pulgasari.github.io/aufbau/sw.js');

aufbauServiceWorker({
  // highest fan-in modules of this page's graph, measured with aufbau/test/graph.mjs
  precache: [
    '../core/index.js',
    'https://pulgasari.github.io/aufbau/js/index.js',
    'https://pulgasari.github.io/aufbau/kits/preact-htm.js',
  ],
});
