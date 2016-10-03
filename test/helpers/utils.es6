export function waitsFor (m, f, t, i) {
  const intervalTime = i || 10

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (f()) {
        clearTimeout(timeout)
        clearInterval(interval)
        resolve()
      }
    }, intervalTime)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      reject(new Error('Waits for condition never met: ' + f.toString()))
    }, t || 2000)
  })
}
