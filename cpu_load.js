// cpu_max.js
const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  const numCPUs = require('os').cpus().length;
  console.log(`Spawning ${numCPUs} worker threads...`);

  for (let i = 0; i < numCPUs; i++) {
    new Worker(__filename);
  }

  console.log('All workers launched.');
} else {
  // A tight loop performing random math to keep the CPU busy.
  function burnCPU() {
    let x = 0;
    while (true) {
      x += Math.random() * Math.random();
      if (x > 1e10) x = 0; // reset occasionally to prevent overflow
    }
  }

  burnCPU();
}
