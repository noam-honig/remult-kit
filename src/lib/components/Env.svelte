<script lang="ts">
  import { mdiRocketLaunchOutline } from '@mdi/js'
  import { Button, Dialog, SelectField, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { databases } from '../cli/db/databases'
  import WelcomeRemult from './WelcomeRemult.svelte'

  let open = false

  let loading = false
  let options = Object.keys(databases).map(key => ({ label: key, value: (databases as any)[key] }))
  let db = databases.auto
  let args: Record<string, string> = {}

  async function checkConnection() {
    try {
      if (
        await ActionsController.checkConnection({
          db: options.find(({ value }) => value == db)!.label as keyof typeof databases,
          args,
        })
      ) {
      }
    } catch (err: any) {
      alert(err.message)
      open = true
    }
  }
</script>

<Dialog bind:open>
  <div class="m-12">
    <div class="m-12">
      <WelcomeRemult></WelcomeRemult>
    </div>

    <p class="text-center font-bold mb-4 text-secondary">
      First things first, we need to connect to your Database 1
    </p>
    <SelectField
      label="Data Provider"
      bind:value={db}
      {options}
      on:change={e => console.info('on:change', e.detail)}
    />
    {#each Object.keys(db.args) as arg}
      <TextField label={arg} bind:value={args[arg]}></TextField>
    {/each}
  </div>
  <div slot="actions">
    <Button>stam</Button>
    <Button
      variant="fill"
      color="primary"
      icon={mdiRocketLaunchOutline}
      {loading}
      on:click={async e => {
        loading = true
        await checkConnection()

        loading = false
      }}>Let's start!</Button
    >
  </div>
</Dialog>
