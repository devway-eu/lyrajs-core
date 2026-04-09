import Busboy from "busboy"

/**
 * Middleware to handle multipart/form-data requests
 * Buffers and parses the data, then allows framework's body parser to work
 */
export const multipartMiddleware = async (req: any, res: any, next: () => void) => {
  const contentType = req.headers["content-type"] || ""

  // Initialize multipartData with defaults for non-multipart requests
  if (!contentType.includes("multipart/form-data")) {
    req.multipartData = { fields: {}, files: [] }
    return next()
  }

  return new Promise<void>((resolve, reject) => {
    const chunks: Buffer[] = []
    const originalOn = req.on.bind(req)

    // Buffer the incoming data
    originalOn("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    originalOn("end", () => {
      try {
        const buffer = Buffer.concat(chunks)

        // Parse with busboy
        const busboy = Busboy({ headers: req.headers })
        const fields: Record<string, string> = {}
        const files: any[] = []

        busboy.on("file", (fieldname, file, info) => {
          const { filename, encoding, mimeType } = info
          const fileChunks: Buffer[] = []

          file.on("data", (chunk) => fileChunks.push(chunk))
          file.on("end", () => {
            const fileBuffer = Buffer.concat(fileChunks)
            files.push({
              fieldname,
              name: filename,
              data: fileBuffer,
              mimetype: mimeType,
              size: fileBuffer.length,
            })
          })
        })

        busboy.on("field", (fieldname, value) => {
          fields[fieldname] = value
        })

        busboy.on("finish", () => {
          // Store parsed data
          req.multipartData = { fields, files }

          // Override req.on to return empty data to framework's parseBody
          // We already parsed the multipart data, so framework doesn't need to
          req.on = function (event: string, callback: Function) {
            if (event === "data") {
              // Don't send any data - we already parsed it
              return req
            } else if (event === "end") {
              // Immediately call end callback with no data
              setImmediate(() => callback())
              return req
            }
            // For other events, use original behavior
            return originalOn(event, callback)
          }

          next()
          resolve()
        })

        busboy.on("error", (error) => {
          console.error("Multipart parsing error:", error)
          res.status(400).json({ message: "Error parsing multipart data" })
          reject(error)
        })

        // Feed buffered data to busboy
        busboy.write(buffer)
        busboy.end()
      } catch (error) {
        console.error("Multipart middleware error:", error)
        next()
        resolve()
      }
    })

    originalOn("error", (error: Error) => {
      console.error("Request stream error:", error)
      reject(error)
    })
  })
}
