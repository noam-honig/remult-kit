<script lang="ts">
  import { mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline } from '@mdi/js'
  import { dev } from '$app/environment'
  import { remult, repo } from 'remult'
  import { onMount } from 'svelte'
  import { Button, Card, Collapse, Icon, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'

  let steps = {
    con: false,
    dep: true,
  }
  let DATABASE_URL = ''
  let loading = false
  let needReboot = false

  let settings: Setting[] = []

  const readEnv = async () => {
    const envLines = await ActionsController.readFile('.env')
    for (let i = 0; i < envLines.length; i++) {
      if (envLines[i].includes('DATABASE_URL')) {
        DATABASE_URL = envLines[i].split('=')[1].trim().replace(/"/g, '')
        steps.con = true
      }
    }
  }

  onMount(async () => {
    await readEnv()

    settings = await remult.repo(Setting).find()
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold mb-5">Setup</h1>

  <Collapse
    popout
    class="bg-white elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={steps.con ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}></Icon> .env
    </div>
    <div class="p-3 bg-gray-100 border-t">
      <p>First thing first, we need to conect to a Database</p>

      <TextField
        label="connection string"
        bind:value={DATABASE_URL}
        placeholder="postgres://postgres:example@127.0.0.1:5432/MY_DB_NAME"
      ></TextField>

      <br />

      <Card title=".env" subheading="file content">
        <div slot="contents" class="border">
          <pre>DATABASE_URL = {DATABASE_URL}</pre>
        </div>
        <div slot="actions" class="p-2">
          <Button
            variant="fill"
            color="green"
            disabled={!DATABASE_URL}
            {loading}
            on:click={async () => {
              loading = true
              needReboot = await ActionsController.writeFile('.env', [
                `DATABASE_URL = ${DATABASE_URL}`,
              ])
              if (!dev) {
                await readEnv()
              }
              loading = false
            }}
            >Write File
          </Button>
          {#if needReboot && dev}
            <i>Reboot is happening in dev mode as vite is looknig at .env</i>
          {/if}
        </div>
      </Card>
    </div>
  </Collapse>

  <Collapse
    popout
    class="bg-white elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={steps.con && steps.dep ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}
      ></Icon> dependencies
    </div>
    <div class="p-3 bg-gray-100 border-t">
      <Card title="node" subheading="commands">
        <div slot="contents" class="border">
          <pre>npm i xxx (Noam's code)</pre>
        </div>
        <div slot="actions" class="p-2">
          <Button
            variant="fill"
            color="green"
            disabled={!DATABASE_URL}
            {loading}
            on:click={async () => {
              loading = true
              // needReboot = await ActionsController.writeFile('.env', [
              //   `DATABASE_URL = ${DATABASE_URL}`,
              // ])
              console.log('... todo ...')
              loading = false
            }}
            >Install
          </Button>
          {#if needReboot}
            <i>Reboot Needed... in dev mode.</i>
          {/if}
        </div>
      </Card>
    </div>
  </Collapse>

  <Collapse
    popout
    open={steps.con}
    class="bg-white elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={steps.con && steps.dep ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}
      ></Icon> settings
    </div>
    <div class="p-3 bg-gray-100 border-t">
      <Card title="remult-kit" subheading="settings">
        <div slot="contents" class="mb-2 grid gap-2">
          {#each settings as setting}
            <div>
              <TextField
                label={setting.id}
                bind:value={setting.value}
                on:change={async () => {
                  remult.repo(Setting).save(setting)
                }}
              ></TextField>
              {#if setting.id === SettingKey.tableProps}
                <i class="text-xs">Presets:</i>
                {#each ['allowApiCrud: false', 'allowApiCrud: true', 'allowApiCrud: Allow.authenticated', 'allowApiCrud: remult.isAllowed("admin")'] as preset}
                  <Button
                    on:click={() => {
                      setting.value = preset
                      remult.repo(Setting).save(setting)
                    }}
                  >
                    {preset}</Button
                  >
                {/each}
              {/if}
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </Collapse>
</main>
