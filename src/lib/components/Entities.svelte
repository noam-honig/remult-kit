<script lang="ts">
  import { mdiLayersTripleOutline, mdiRefresh } from '@mdi/js'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { ActionsController } from '$shared/contollers/ActionsController'
  import { Setting, SettingKey } from '$shared/entities/Setting'
  import { Button, Card, Icon, TextField } from '$ui'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import Code from './Code.svelte'

  let loading = false

  onMount(async () => {
    await refresh()
  })

  const refresh = async () => {
    loading = true
    $remultInfos = await ActionsController.getDbEntitiesMetadata($connectionInfo)
    loading = false
  }

  // const order = tableOrderStore({ initialBy: 'name', initialDirection: 'asc' })

  $: sortedData = [
    ...($remultInfos.entities ?? []).filter(c =>
      c.meta.table.className.toLowerCase().includes((search ?? '').toLowerCase()),
    ),
  ]

  let selectedItems: string[] = []

  let search = ''

  const updateSelection = (name: string) => {
    if (selectedItems.includes(name)) {
      selectedItems = selectedItems.filter(i => i !== name)
    } else {
      selectedItems = [...selectedItems, name]
    }
  }
  let entityOpen = ''
  const updateEntityOpen = (name: string) => {
    if (entityOpen === name) {
      entityOpen = ''
    } else {
      entityOpen = name
    }
  }
</script>

{#if ($remultInfos.entities ?? []).length > 0}
  <div class="collapse bg-base-300">
    <input type="checkbox" checked />
    <div class="collapse-title text-xl font-medium">
      <div class="flex items-center gap-4">
        <Icon path={mdiLayersTripleOutline}></Icon> Entities
      </div>
    </div>
    <div class="collapse-content">
      <div class="grid gap-4">
        <div class="flex justify-between">
          <h2>
            <Button icon={mdiRefresh} on:click={refresh} disabled={loading} class="btn-ghost"
              >Refresh</Button
            >
          </h2>
          <Button
            disabled={selectedItems.length === 0}
            on:click={async () => {
              const filtered = $remultInfos.entities.filter(e =>
                selectedItems.includes(e.meta.table.className),
              )

              const outputDir = (await remult.repo(Setting).findId(SettingKey.outputDir)).value

              for (const element of filtered) {
                await ActionsController.writeFile(
                  `${outputDir}/${element.meta.table.className}.ts`,
                  [element.fileContent],
                )
              }
            }}>Write Files</Button
          >
        </div>
        <div class="flex gap-5 justify-between items-end">
          <div class="w-full">
            <TextField
              label="filter"
              bind:value={search}
              placeholder="looking for a specific entity?"
            ></TextField>
          </div>
          <div class="grid gap-1 mx-2">
            <Button
              class="btn-xs"
              disabled={selectedItems.length === 0}
              on:click={() => {
                selectedItems = []
              }}
            >
              Nothing
            </Button>
            <Button
              class="btn-xs"
              disabled={selectedItems.length === sortedData.length}
              on:click={() => {
                selectedItems = sortedData.map(c => c.meta.table.className)
              }}
            >
              All
            </Button>
          </div>
        </div>
        <!-- </div>
      <ul class="menu bg-base-200 rounded-box"> -->
        <div class="grid gap-2">
          {#each sortedData as row}
            <div transition:slide>
              <Card>
                <svelte:fragment slot="title">
                  <div class="flex items-center">
                    <button
                      on:click={() => updateEntityOpen(row.meta.table.className)}
                      class="card-title flex-1 grid grid-cols-2 place-items-start items-center"
                    >
                      <p>
                        {row.meta.table.className}
                      </p>
                      <i class="text-xs w-24 text-right">{row.meta.colsMeta.length + ' fields'}</i>
                    </button>

                    <div class="flex justify-end">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(row.meta.table.className)}
                        on:change={() => updateSelection(row.meta.table.className)}
                        class="checkbox"
                      />
                    </div>
                  </div>
                </svelte:fragment>

                {#if entityOpen === row.meta.table.className}
                  <div class="p-2">
                    <Code code={row.fileContent}></Code>
                    <Button
                      on:click={async () => {
                        const outputDir = (await remult.repo(Setting).findId(SettingKey.outputDir))
                          .value

                        await ActionsController.writeFile(
                          `${outputDir}/${row.meta.table.className}.ts`,
                          [row.fileContent],
                        )
                      }}>Write File</Button
                    >
                  </div>
                {/if}
              </Card>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
