<script lang="ts">
  import {
    mdiCheckboxBlankBadgeOutline,
    mdiCheckboxBlankCircleOutline,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarkedOutline,
    mdiRocketLaunchOutline,
  } from '@mdi/js'
  import { databases, type ConnectionInfo } from '$lib/cli/db/databases'
  import FieldContainer from '$lib/components/ui/FieldContainer.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  // import { Button, Card, Collapse, Icon, SelectField, TextField } from 'svelte-ux'
  import { Button, SelectField, TextField } from '$ui'
  import { Highlight } from 'svelte-highlight'
  import typescript from 'svelte-highlight/languages/typescript'

  let options = Object.keys(databases).map(key => ({ label: key, value: key }))

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
</script>

<div class="collapse bg-base-300">
  <input type="checkbox" />
  <div class="collapse-title text-xl font-medium">
    <div class="flex items-center gap-4">
      <Icon path={getIcon($connectionInfo.status)}></Icon> connection
    </div>
  </div>
  <div class="collapse-content">
    <div class="p-3 grid gap-4">
      <SelectField
        label="Data Provider"
        bind:value={$connectionInfo.db}
        on:change={() => {
          connectionInfo.reset($connectionInfo.db)
        }}
        {options}
      />

      <form
        on:submit|preventDefault={() => connectionInfo.check($connectionInfo)}
        class="grid gap-4"
      >
        {#each Object.keys(databases[$connectionInfo.db].args) as arg}
          <TextField
            label={arg}
            bind:value={$connectionInfo.args[arg]}
            placeholder={placeHolder(arg)}
          ></TextField>
        {/each}

        <Button
          type="submit"
          icon={mdiRocketLaunchOutline}
          loading={$connectionInfo.status === 'checking'}
        >
          Check Connection!
        </Button>
      </form>
    </div>
  </div>
</div>

<!-- <Collapse
  popout
  class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
>
  
  <div class="p-3 grid gap-4">
  
    <form on:submit|preventDefault={() => connectionInfo.check($connectionInfo)} class="grid gap-4">
      {#each Object.keys(databases[$connectionInfo.db].args) as arg}
        <TextField label={arg} bind:value={$connectionInfo.args[arg]} placeholder={placeHolder(arg)}
        ></TextField>
      {/each}

      <Button
        type="submit"
        variant="fill"
        color="primary"
        icon={mdiRocketLaunchOutline}
        loading={$connectionInfo.status === 'checking'}
      >
        Check Connection!
      </Button>

      {#if $connectionInfo.error}
        <Card title="Error" class="text-danger border-danger">
          <div>
            <pre>{$connectionInfo.error}</pre>
          </div>
        </Card>
      {/if}
    </form>

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
</Collapse> -->
