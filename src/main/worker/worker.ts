const { parentPort, workerData } = require('worker_threads')

const pair = workerData.pair

function startWorking() {
  setInterval(() => {
    parentPort.postMessage(`Worker for ${pair} is processing...`)
  }, 3000)
}

startWorking()
