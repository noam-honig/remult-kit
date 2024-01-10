#!/usr/bin/env node
import { Log, green } from '@kitql/helpers'
import { spawn } from 'child_process'
import { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'path'

const isWindows = ['win32', 'win64'].includes(os.platform())
const metaUrl = isWindows
  ? import.meta.url.replace('file:///', '')
  : import.meta.url.replace('file://', '')

const rootPath = path.join(metaUrl, '../../..')

const log = new Log('remult-kit')

const { version } = JSON.parse(
  readFileSync(new URL(path.join(rootPath, 'package.json'), import.meta.url), 'utf-8'),
)
console.log()
log.info(`v${green(`${version}`)} - Starting`)

const runMe = path.join(rootPath, 'remult-kit-app')

try {
  const npx = spawn(isWindows ? 'node.cmd' : 'node', [runMe], {
    env: {
      PORT: 4321,
      HOST: '127.0.0.1',
      ...process.env,
    },
  })

  // Capture standard output and error
  npx.stdout.on('data', data => {
    log.info(`${data}`)
  })

  npx.stderr.on('data', data => {
    log.error(`${data}`)
  })

  // Listen for errors and exit event
  npx.on('error', error => {
    log.error(`${error.message}`)
  })

  npx.on('close', code => {
    log.info(`Child process exited with code ${code}`)
  })
} catch (err) {
  log.error('something went wrong', err)
}
