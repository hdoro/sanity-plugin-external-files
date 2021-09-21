const filterData = (audioBuffer: AudioBuffer) => {
  // We only need to work with one channel of data
  const rawData = audioBuffer.getChannelData(0)

  // Number of samples we want to have in our final data set
  const samples = 70

  // the number of samples in each subdivision
  const blockSize = Math.floor(rawData.length / samples)

  const filteredData = []
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i // the location of the first sample in the block
    let sum = 0
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
    }
    filteredData.push(sum / blockSize) // divide the sum by the block size to get the average
  }
  return filteredData
}

// Normalizes all data points on a 0-1 scale for proper visualization
const normalizeData = (filteredData: number[]): Number[] => {
  const multiplier = Math.pow(Math.max(...filteredData), -1)
  return filteredData.map((n) => Number((n * multiplier).toFixed(4)))
}

export default async function getWaveformData(file: File) {
  if (!file) {
    return
  }
  
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)()

  const arrayBuffer = await file.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const normalizedData = normalizeData(filterData(audioBuffer))
  return normalizedData
}
