#!/usr/bin/env node
import { Log, green, red, yellow } from '@kitql/helpers'
import { spawn } from 'child_process'
import { config } from 'dotenv'
import { readFileSync, existsSync } from 'node:fs'
import open from 'open'
import path from 'path'
import { fileURLToPath } from 'url'

const metaUrl = fileURLToPath(import.meta.url)
const cwd = process.cwd()
if (existsSync(path.join(cwd, '.env'))) config({ path: path.join(cwd, '.env') })

const rootPath = path.join(metaUrl, '../../..')

const log = new Log('remult-kit')

const { version } = JSON.parse(readFileSync(path.join(rootPath, 'package.json'), 'utf-8'))

log.info(`v${green(`${version}`)} - Starting`)

const runMe = path.join(rootPath, 'remult-kit-app', 'index.js')

function runServer(env) {
  try {
    const npx = spawn('node', [runMe], { env })

    const url = `http://${env.HOST}:${env.PORT}`

    // Capture standard output and error
    npx.stdout.on('data', data => {
      if (data.includes('Listening on')) {
        log.info(`Listening on ${url}`)
        open(url)
      } else log.info(`${data}`)
    })

    npx.stderr.on('data', data => {
      if (data.includes('EADDRINUSE')) {
        log.info(`Port ${red(env.PORT)} is already in use, trying ${yellow(env.PORT + 1)}...`)
        runServer({ ...env, PORT: env.PORT + 1 })
      } else {
        log.error(`${data}`)
      }
    })

    // Listen for errors and exit event
    npx.on('error', error => {
      log.error(`${error.message}`)
    })

    npx.on('close', code => {
      // log.info(`Child process exited with code ${code}`)
    })
  } catch (err) {
    log.error('something went wrong', err)
  }
}

runServer({
  PORT: 4321,
  HOST: '127.0.0.1',
  ...process.env,
})
