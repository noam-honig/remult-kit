<script lang="ts">
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarkedOutline,
    mdiRocketLaunchOutline,
  } from '@mdi/js'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import { Button, Card, Collapse, Icon, SelectField, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'
  import { databases, load, save } from '../../lib/cli/db/databases'

  let steps = {
    con: false,
    dep: true,
  }

  let loading = false

  let settings: Setting[] = []
  let error = ''

  let options = Object.keys(databases).map(key => ({ label: key, value: (databases as any)[key] }))
  let db = databases.auto
  let args: Record<string, string> = {}

  function placeHolder(arg: string) {
    return 'process.env["' + (db.args as any)[arg].envName + '"]'
  }
  async function checkConnection() {
    try {
      error = ''
      let info = {
        db: options.find(({ value }) => value == db)!.label as keyof typeof databases,
        args,
      }
      if (await ActionsController.checkConnection(info)) {
        save(info)
      }
    } catch (err: any) {
      error = err.message
    }
  }

  onMount(async () => {
    settings = await remult.repo(Setting).find()
    let loaded = load()
    if (loaded) {
      db = databases[loaded.db] as any
      args = loaded.args
    }
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold mb-5">Setup</h1>

  <Collapse
    popout
    class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={steps.con ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}></Icon> connection
    </div>
    <div class="p-3 border-t">
      <SelectField
        label="Data Provider"
        bind:value={db}
        {options}
        on:change={e => console.info('on:change', e.detail)}
      />
      {#each Object.keys(db.args) as arg}
        <TextField label={arg} bind:value={args[arg]} placeholder={placeHolder(arg)}></TextField>
      {/each}
      {#if error}
        <Card title="Error" class="text-red-500">
          <div slot="contents" class="border">
            <pre>{error}</pre>
          </div>
        </Card>
      {/if}
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
      <div class="p-3 border-t">
        {#if db != databases.auto}
          <Card title=".ENV">
            <div slot="contents" class="border">
              {#each Object.keys(db.args).filter(k => args[k]) as arg}
                <pre>{db.args[arg]?.envName}={args[arg]}</pre>
              {/each}
            </div>
            <div slot="actions" class="p-2"></div>
          </Card>
          <Card title="node" subheading="commands">
            <div slot="contents" class="border">
              <pre>npm i {db.npm.join(' ')}</pre>
            </div>
            <div slot="actions" class="p-2"></div>
          </Card>

          <Card title="Data Provider Code">
            <div slot="contents" class="border">
              <pre>{db.getCode(args)}</pre>
            </div>
            <div slot="actions" class="p-2"></div>
          </Card>
        {/if}
      </div>
    </div>
  </Collapse>

  <Collapse
    popout
    open={steps.con}
    class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={steps.con && steps.dep ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline}
      ></Icon> settings
    </div>
    <div class="p-3 bg-surface-300 border-t">
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
                {#each ['allowApiCrud: false', 'allowApiCrud: true', 'allowApiCrud: Allow.authenticated', 'allowApiCrud: "admin"'] as preset}
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
