<script lang="ts">
  import { mdiCheckCircleOutline } from '@mdi/js'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import Highlight from 'svelte-highlight'
  import typescript from 'svelte-highlight/languages/typescript'
  import atomOneDark from 'svelte-highlight/styles/atom-one-dark'
  import { Button, Collapse, Icon, Notification, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'

  $: search = ''
  let msg = ''
  let loading = false
  let open = false

  onMount(async () => {
    try {
      $remultInfos = await ActionsController.getDbEntitiesMetadata($connectionInfo)
    } catch (error) {
      // @ts-ignore
      msg = error.message
    }
  })
</script>

<svelte:head>
  <!-- eslint-disable-next-line -->
  {@html atomOneDark}
</svelte:head>

<main class="p-2">
  <h1 class="text-lg font-semibold">Entities</h1>

  <TextField
    label="filter"
    type="search"
    bind:value={search}
    placeholder="looking for a specific entity?"
  ></TextField>

  <br />
  <div class="divide-y">
    {#each $remultInfos.entities.filter(c => c.meta.table.className
        .toLowerCase()
        .includes((search ?? '').toLowerCase())) as { fileContent, meta }}
      <Collapse
        popout
        class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
      >
        <div slot="trigger" class="flex-1 px-3 py-3">{meta.table.className}</div>

        <div>
          <div class="text-xs">
            <Highlight language={typescript} code={fileContent} />
          </div>

          <div class="p-2">
            <Button
              variant="fill"
              color="primary"
              {loading}
              on:click={async () => {
                loading = true
                const outputDir = (await remult.repo(Setting).findId(SettingKey.outputDir)).value
                await ActionsController.writeFile(
                  `${outputDir}/entities/${meta.table.className}.ts`,
                  [fileContent],
                )
                loading = false
                open = true
                setTimeout(() => {
                  open = false
                }, 1500)
              }}
            >
              Write files
            </Button>
          </div>
        </div>
      </Collapse>
    {/each}
  </div>
  <p class="text-red-500">
    {msg}
  </p>
</main>

<div class="w-[300px] absolute top-5 right-5 z-50">
  <Notification {open} closeIcon>
    <div slot="icon">
      <Icon path={mdiCheckCircleOutline} class="text-green-500" />
    </div>
    <div slot="title">Successfully wrote!</div>
    <div slot="description">The file is on your disk 🎉</div>
  </Notification>
</div>
