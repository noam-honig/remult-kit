<script lang="ts">
  import { mdiRocketLaunchOutline } from '@mdi/js'
  import { dev } from '$app/environment'
  import { onMount } from 'svelte'
  import { Button, Dialog, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import WelcomeRemult from './WelcomeRemult.svelte'

  let open = false
  let DATABASE_URL = ''
  let loading = false

  const readEnv = async () => {
    const envLines = await ActionsController.readFile('.env')
    for (let i = 0; i < envLines.length; i++) {
      if (envLines[i].includes('DATABASE_URL')) {
        DATABASE_URL = envLines[i].split('=')[1].trim().replace(/"/g, '')
      }
    }
    if (!DATABASE_URL) {
      open = true
    }
  }

  onMount(async () => {
    await readEnv()
  })
</script>

<Dialog bind:open>
  <div class="m-12">
    <div class="m-12">
      <WelcomeRemult></WelcomeRemult>
    </div>

    <p class="text-center font-bold mb-4 text-secondary">
      First things first, we need to connect to your Database
    </p>

    <TextField
      label="connection string (postgres, mySQL, ...)"
      bind:value={DATABASE_URL}
      placeholder="postgres://postgres:example@127.0.0.1:5432/MY_DB_NAME"
    ></TextField>
  </div>
  <div slot="actions">
    <Button
      variant="fill"
      color="primary"
      icon={mdiRocketLaunchOutline}
      disabled={!DATABASE_URL}
      {loading}
      on:click={async () => {
        loading = true
        await ActionsController.writeFile('.env', [`DATABASE_URL = ${DATABASE_URL}`])
        if (!dev) {
          await readEnv()
        }
        loading = false
      }}>Let's start!</Button
    >
  </div>
</Dialog>
