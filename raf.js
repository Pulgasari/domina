// raf.js

// Alle Lesevorgänge eines Frames laufen vor allen Schreibvorgängen.
// Damit rechnet der Browser einmal Layout statt einmal pro Element.

const q = { read: [], write: [] };
let scheduled = false;

const schedule = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(flush);
};

const run = ({ fn, resolve, reject }) => {
  try { resolve(fn()); }
  catch (err) { reject(err); console.error('domina/raf:', err); }
};

function flush() {
  scheduled = false;

  // Queues tauschen, BEVOR die Tasks laufen – was währenddessen
  // dazukommt, landet sauber im nächsten Frame
  const reads  = q.read;
  const writes = q.write;
  q.read = [];
  q.write = [];

  for (const t of reads)  run(t);
  for (const t of writes) run(t);

  if (q.read.length || q.write.length) schedule();
}

const enqueue = (type, fn) => new Promise((resolve, reject) => {
  q[type].push({ fn, resolve, reject });
  schedule();
});

export const

  measure = fn => enqueue('read',  fn),
  mutate  = fn => enqueue('write', fn),

  // Lesen und Schreiben im SELBEN Frame – das ist der eigentlich nützliche Fall
  frame = (readFn, writeFn) => new Promise((resolve, reject) => {
    q.read.push({
      fn: readFn,
      reject,
      resolve: value => {
        q.write.push({ fn: () => writeFn(value), resolve, reject });
      },
    });
    schedule();
  }),

  nextFrame = () => new Promise(r => requestAnimationFrame(() => r())),

  // Notausgang: sofort abarbeiten, ohne auf den Frame zu warten
  flushSync = () => flush();
