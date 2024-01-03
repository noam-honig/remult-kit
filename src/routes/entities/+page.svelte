<script lang="ts">
  import { mdiCheckCircleOutline } from '@mdi/js'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import { Button, Collapse, Icon, Notification, table, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'

  $: search = ''
  let msg = ''
  let loading = false
  let open = false

  onMount(async () => {
    try {
      $remultInfos = await ActionsController.check()
    } catch (error) {
      if (error instanceof Error) {
        msg = error.message
      }
    }
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold">Entities</h1>

  <TextField
    label="filter"
    type="search"
    bind:value={search}
    placeholder="looking for a specific entity?"
  ></TextField>

  <br />
  {#each $remultInfos.entities.filter(c => c.meta.table.className
      .toLowerCase()
      .includes((search ?? '').toLowerCase())) as { fileContent, meta }}
    <!-- <div class="my-4">
      <Card title={key} subheading="Entity">
        <div slot="contents">
          <pre class="text-xs mb-4">{value}</pre>
        </div>
      </Card>
    </div> -->
    <Collapse
      popout
      class="bg-white elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
    >
      <div slot="trigger" class="flex-1 px-3 py-3">{meta.table.className}</div>
      <div class="p-3 bg-gray-100 border-t">
        <pre class="text-xs">{fileContent}</pre>
      </div>
      <div class="p-2">
        <Button
          variant="fill"
          color="green"
          {loading}
          on:click={async () => {
            loading = true
            const outputDir = (await remult.repo(Setting).findId(SettingKey.outputDir)).value
            await ActionsController.writeFile(`${outputDir}/entities/${meta.table.className}.ts`, [
              fileContent,
            ])
            loading = false
            open = true
            setTimeout(() => {
              open = false
            }, 1500)
          }}
        >
          Write files
        </Button>
      </div></Collapse
    >
  {/each}
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
