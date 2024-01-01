#!/usr/bin/env node

import { spawn } from "child_process"
import path from "path"

const currentDirectory = process.cwd()

console.log(import.meta.url)

console.log(currentDirectory)
const runMe = path.join(
  import.meta.url.replace("file:///", ""),
  "../src/server/index.ts"
)

console.log(runMe)

//if (false)
try {
  const npx = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsx", runMe],
    {
      env: {
        ...process.env,
        API_PATH: "src/server/api.ts",
      },
    }
  )

  // Capture standard output and error
  npx.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`)
  })

  npx.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`)
  })

  // Listen for errors and exit event
  npx.on("error", (error) => {
    console.error(`Error: ${error.message}`)
  })

  npx.on("close", (code) => {
    console.log(`Child process exited with code ${code}`)
  })
} catch (err) {
  console.error("something went wrong", err)
}
