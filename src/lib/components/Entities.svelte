<script lang="ts">
  import { mdiLayersTripleOutline, mdiRefresh } from '@mdi/js'
  import { onMount } from 'svelte'
  import { r } from 'svelte-highlight/languages'
  import { slide } from 'svelte/transition'

  import { remult } from 'remult'

  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { ActionsController } from '$shared/controllers/ActionsController'
  import { Setting, SettingKey } from '$shared/entities/Setting'
  import { Button, Card, Icon, TextField } from '$ui'

  import Code from './Code.svelte'

  let loading = false

  onMount(async () => {
    await refresh()
  })

  const refresh = async () => {
    if (loading) return
    loading = true
    try {
      if ($connectionInfo.status === 'good')
        $remultInfos = await ActionsController.getDbEntitiesMetadata($connectionInfo)
    } finally {
      loading = false
    }
  }
  connectionInfo.subscribe((v) => refresh())

  // const order = tableOrderStore({ initialBy: 'name', initialDirection: 'asc' })

  $: sortedData = [
    ...($remultInfos.entities ?? []).filter((c) =>
      c.meta.table.className.toLowerCase().includes((search ?? '').toLowerCase()),
    ),
  ]

  let search = ''

  let entityOpen = ''
  const updateEntityOpen = (name: string) => {
    if (entityOpen === name) {
      entityOpen = ''
    } else {
      entityOpen = name
    }
  }
  async function saveTable(row: (typeof $remultInfos.entities)[0]) {
    const rowToSave = [row]
    const handled = new Set<string>(row.meta.table.className)
    function iterateRelations(row: (typeof $remultInfos.entities)[0]) {
      row.meta.entitiesImports.forEach((x) => {
        if (!handled.has(x)) {
          handled.add(x)
          const r = $remultInfos.entities.find((r) => r.meta.table.className === x)
          if (r) {
            rowToSave.push(r)
            iterateRelations(r)
          }
        }
      })
    }
    iterateRelations(row)
    await ActionsController.writeFiles(
      rowToSave.map((c) => ({ className: c.meta.table.className, data: [c.fileContent] })),
    )
  }
</script>

{#if $connectionInfo.status === 'good'}
  <div class="collapse bg-base-300">
    <input type="checkbox" checked />
    <div class="collapse-title text-xl font-medium">
      <div class="flex items-center gap-4">
        <Icon path={mdiLayersTripleOutline}></Icon> Entities
      </div>
    </div>
    <div class="collapse-content">
      {#if loading}
        Loading...
      {:else}
        <div class="grid gap-4">
          <div class="flex justify-between">
            <h2>
              <Button icon={mdiRefresh} on:click={refresh} disabled={loading} class="btn-ghost"
                >Refresh</Button
              >
            </h2>
            <Button
              on:click={async () => {
                const filtered = sortedData

                await ActionsController.writeFiles(
                  filtered.map((c) => {
                    return {
                      className: c.meta.table.className,
                      data: [c.fileContent],
                    }
                  }),
                )
              }}
            >
              Create Entity files for all {sortedData.length} entities
            </Button>
          </div>
          <div class="flex items-end justify-between gap-5">
            <div class="w-full">
              <TextField
                label="filter"
                bind:value={search}
                placeholder="looking for a specific entity?"
              ></TextField>
            </div>
          </div>
          <!-- </div>
      <ul class="menu bg-base-200 rounded-box"> -->
          <div class="grid gap-2">
            {#each sortedData as row}
              <div>
                <Card>
                  <svelte:fragment slot="title">
                    <div class="flex items-center">
                      <button
                        on:click={() => updateEntityOpen(row.meta.table.className)}
                        class="card-title grid flex-1 grid-cols-2 place-items-start items-center"
                      >
                        <p>
                          {row.meta.table.className}
                        </p>
                        <i class="w-24 text-right text-xs">{row.meta.colsMeta.length + ' fields'}</i
                        >
                      </button>

                      <div class="flex justify-end">
                        <Button on:click={async () => saveTable(row)}>Write File</Button>
                      </div>
                    </div>
                  </svelte:fragment>

                  {#if entityOpen === row.meta.table.className}
                    <div class="p-2">
                      <Code code={row.fileContent}></Code>
                      <pre>
                        {JSON.stringify(row.meta, undefined, 2)}
                      </pre>
                    </div>
                  {/if}
                </Card>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
