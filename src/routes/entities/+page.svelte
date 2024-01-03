<script lang="ts">
  import { remultInfos } from '$lib/stores/remultInfos'
  import { onMount } from 'svelte'
  import { Button, Collapse, table, TextField } from 'svelte-ux'
  import { ActionsController } from '../../hooks/contollers/ActionsController'

  $: search = ''
  let msg = ''
  onMount(async () => {
    try {
      $remultInfos = await ActionsController.check()
    } catch (error) {
      msg = error.message
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
          on:click={async () => {
            console.log('Write...')
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
