/* domina/docs/sw.js

classic script on purpose — a service worker has no import map, so bare specifiers
never resolve there. importScripts() performs no specifier resolution at all and
is how a worker shares code. see aufbau/sw.js for the reasoning in full.

register WITHOUT type: 'module'.
*/

importScripts('https://code.pulgasari.dev/aufbau/sw.js');

aufbauServiceWorker({
  // highest fan-in modules of this page's graph, measured with aufbau/test/graph.mjs
  precache: [
    '../core/index.js',
    'https://code.pulgasari.dev/aufbau/js/index.js',
    'https://code.pulgasari.dev/aufbau/kits/preact-htm.js',
  ],
});
