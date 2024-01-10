<script lang="ts">
  import {
    mdiCheckboxBlankBadgeOutline,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarkedOutline,
    mdiRocketLaunchOutline,
  } from '@mdi/js'
  import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import { Highlight } from 'svelte-highlight'
  import typescript from 'svelte-highlight/languages/typescript'
  import { Button, Card, Collapse, Icon, SelectField, TextField } from 'svelte-ux'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'

  let steps = {
    con: false,
    dep: true,
  }

  let settings: Setting[] = []

  let options = Object.keys(databases).map(key => ({ label: key, value: key }))

  function placeHolder(arg: string) {
    return 'process.env["' + envName(arg) + '"]'
  }

  function envName(arg: string) {
    // @ts-expect-error
    return databases[$connectionInfo.db].args[arg]?.envName ?? ''
  }

  const getIcon = (status: ConnectionInfo['status']) => {
    return status === '???'
      ? mdiCheckboxBlankBadgeOutline
      : status === 'good'
        ? mdiCheckboxMarkedOutline
        : mdiCheckboxBlankOutline
  }

  onMount(async () => {
    settings = await remult.repo(Setting).find()
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold mb-5">Setup</h1>

  <!-- open -->
  <Collapse
    popout
    class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={getIcon($connectionInfo.status)}></Icon> connection
    </div>
    <div class="p-3 grid gap-4">
      <SelectField
        label="Data Provider"
        bind:value={$connectionInfo.db}
        on:change={() => {
          connectionInfo.reset($connectionInfo.db)
        }}
        {options}
      />

      {#each Object.keys(databases[$connectionInfo.db].args) as arg}
        <TextField label={arg} bind:value={$connectionInfo.args[arg]} placeholder={placeHolder(arg)}
        ></TextField>
      {/each}

      <Button
        variant="fill"
        color="primary"
        icon={mdiRocketLaunchOutline}
        loading={$connectionInfo.status === '???'}
        on:click={() => connectionInfo.check($connectionInfo)}
      >
        Check Connection!</Button
      >
      {#if $connectionInfo.error}
        <Card title="Error" class="text-danger border-danger">
          <div>
            <pre>{$connectionInfo.error}</pre>
          </div>
        </Card>
      {/if}

      <div class="p-3 text-sm grid gap-2">
        {#if $connectionInfo.db !== 'auto'}
          <h2 class="text-lg font-medium">You can setup this now:</h2>

          <Card title=".env" subheading="env file">
            <div slot="contents">
              <div class="border">
                {#each Object.entries($connectionInfo.args).filter(([arg, value]) => value) as [arg, value]}
                  <Highlight
                    language={typescript}
                    code={`${envName(arg)}=${$connectionInfo.args[arg]}`}
                  />
                {:else}
                  <i class="text-secondary">No environement variables yet!</i>
                {/each}
              </div>
            </div>
            <div slot="actions" class="p-2"></div>
          </Card>

          <Card title="Add dependencies" subheading="commands">
            <div slot="contents" class="border">
              <Highlight
                language={typescript}
                code={`npm i ${databases[$connectionInfo.db].npm.join(' ')} -D`}
              />
            </div>
            <div slot="actions" class="p-2"></div>
          </Card>

          <Card title="Data Provider" subheading="Code">
            <div slot="contents" class="border">
              <Highlight
                language={typescript}
                code={databases[$connectionInfo.db].getCode($connectionInfo.args)}
              />
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
