<script lang="ts">
  import {
    mdiCheckboxBlankBadgeOutline,
    mdiCheckboxBlankCircleOutline,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarkedOutline,
    mdiRocketLaunchOutline,
  } from '@mdi/js'
  import { confetti } from '@neoconfetti/svelte'

  import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { Button, Card, SelectField, TextField } from '$ui'

  import Code from './Code.svelte'

  let options = Object.keys(databases).map((key) => ({ label: key, value: key }))

  function placeHolder(arg: string) {
    return 'process.env["' + envName(arg) + '"]'
  }

  function envName(arg: string) {
    // @ts-expect-error
    return databases[$connectionInfo.db].args[arg]?.envName ?? ''
  }

  const getIcon = (status: ConnectionInfo['status']) => {
    return status === 'checking'
      ? mdiCheckboxBlankBadgeOutline
      : status === '???'
        ? mdiCheckboxBlankCircleOutline
        : status === 'good'
          ? mdiCheckboxMarkedOutline
          : mdiCheckboxBlankOutline
  }

  const getCodeEnv = (con: ConnectionInfo) => {
    return Object.entries(con.args)
      .filter(([arg, value]) => value)
      .map(([arg, value]) => {
        return `${envName(arg)} = ${value}`
      })
  }

  let showConfetti = false

  let defaultCheched = false
  let unSub = () => {}
  unSub = connectionInfo.subscribe((v) => {
    if (v.status === 'bad') {
      defaultCheched = true
      if (unSub) {
        unSub()
      }
    } else if (v.status === 'good') {
      defaultCheched = false
      if (unSub) {
        unSub()
      }
    }
  })
</script>

<div class="collapse bg-base-300">
  <input type="checkbox" checked={defaultCheched} />
  <div class="collapse-title text-xl font-medium">
    <div class="flex items-center gap-4">
      <Icon path={getIcon($connectionInfo.status)}></Icon> Connection
    </div>
  </div>
  <div class="collapse-content">
    <div class="grid gap-4 p-3">
      <SelectField
        label="Data Provider"
        bind:value={$connectionInfo.db}
        on:change={() => {
          connectionInfo.reset($connectionInfo.db)
        }}
        {options}
      />

      <form
        on:submit|preventDefault={async () => {
          showConfetti = false
          const res = await connectionInfo.check($connectionInfo)
          if (res.status === 'good') {
            showConfetti = true
          }
        }}
        class="grid gap-4"
      >
        {#each Object.keys(databases[$connectionInfo.db].args) as arg}
          <TextField
            label={arg}
            bind:value={$connectionInfo.args[arg]}
            placeholder={placeHolder(arg)}
          ></TextField>
        {/each}

        {#if showConfetti}
          <center>
            <div use:confetti={{ stageWidth: 600, stageHeight: 400, force: 1 }} />
          </center>
        {/if}

        {#if $connectionInfo.error && $connectionInfo.db === 'auto (from environment variables)'}
          <Card title="Info" class="border border-primary">
            <pre class="text-base-content">{$connectionInfo.error}</pre>
          </Card>
        {/if}

        <Button
          type="submit"
          icon={mdiRocketLaunchOutline}
          loading={$connectionInfo.status === 'checking'}
        >
          Check Connection!
        </Button>

        {#if $connectionInfo.error && $connectionInfo.db !== 'auto (from environment variables)'}
          <Card title="Error" class="border border-error">
            <pre class="text-error">{$connectionInfo.error}</pre>
          </Card>
        {/if}
      </form>

      <div class="grid gap-2 p-4 text-sm">
        {#if $connectionInfo.db !== 'auto (from environment variables)'}
          <h2 class="text-lg font-medium">You can setup this now:</h2>

          <Card title=".env" subheading="env file">
            {#if getCodeEnv($connectionInfo).length > 0}
              <Code code={getCodeEnv($connectionInfo).join('\n')} />
            {:else}
              <i class="text-secondary">No environement variables yet!</i>
            {/if}
          </Card>

          <Card title="Add dependencies" subheading="commands">
            <Code code={`npm i ${databases[$connectionInfo.db].npm.join(' ')}`} />
          </Card>

          <Card title="Data Provider" subheading="Code">
            <Code code={databases[$connectionInfo.db].getCode($connectionInfo.args)} />
          </Card>
        {/if}
      </div>
    </div>
  </div>
</div>
