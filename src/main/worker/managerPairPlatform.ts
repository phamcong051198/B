/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker } from 'worker_threads'

const activeWorkers = new Map()

export const managerPairPlatform = (
  data: { id: number; key: string; platform1: string; platform2: string }[]
) => {
  console.log('123', data)
  const newPairs = data.map((item) => item.key)
  newPairs.forEach((pair) => {
    if (!activeWorkers.has(pair)) {
      const worker = new Worker('./src/main/worker/worker.ts', {
        workerData: { pair }
      })

      worker.on('message', (msg) => {
        console.log(`Worker [${pair}] says:`, msg)
      })

      worker.on('error', (err) => {
        console.error(`Worker [${pair}] error:`, err)
        activeWorkers.delete(pair)
      })

      worker.on('exit', (code) => {
        console.log(`Worker [${pair}] exited with code ${code}`)
        activeWorkers.delete(pair)
      })

      activeWorkers.set(pair, worker)
      console.log(`🆕 Worker [${pair}] created.`)
    }
  })

  // 🧹 2. Dọn các worker không còn trong danh sách pair mới
  for (const existingPair of activeWorkers.keys()) {
    if (!newPairs.includes(existingPair)) {
      const workerToRemove = activeWorkers.get(existingPair)
      workerToRemove.terminate() // kết thúc worker
      activeWorkers.delete(existingPair)
      console.log(`🗑️ Worker [${existingPair}] terminated.`)
    }
  }
}
