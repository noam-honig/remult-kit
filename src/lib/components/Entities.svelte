<script lang="ts">
  import { mdiRefresh } from '@mdi/js'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  import { Button, Card, Checkbox, cls, ListItem, tableOrderStore, TextField } from 'svelte-ux'
  import { slide } from 'svelte/transition'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { Setting, SettingKey } from '../../hooks/entities/Setting'

  let loading = false

  onMount(async () => {
    await refresh()
  })

  const refresh = async () => {
    loading = true
    $remultInfos = await ActionsController.getDbEntitiesMetadata($connectionInfo)
    loading = false
  }

  const order = tableOrderStore({ initialBy: 'name', initialDirection: 'asc' })

  $: sortedData = [
    ...($remultInfos.entities ?? []).filter(c =>
      c.meta.table.className.toLowerCase().includes((search ?? '').toLowerCase()),
    ),
  ].sort($order.handler)

  let selectedItems: string[] = []

  let search = ''

  const updateSelection = (name: string) => {
    if (selectedItems.includes(name)) {
      selectedItems = selectedItems.filter(i => i !== name)
    } else {
      selectedItems = [...selectedItems, name]
    }
  }
</script>

{#if ($remultInfos.entities ?? []).length > 0}
  <Card>
    <div class="m-2 grid gap-4">
      <div class="flex justify-between">
        <h2>
          Entities <Button
            iconOnly
            icon={mdiRefresh}
            classes={{ icon: loading ? 'animate-spin' : '' }}
            on:click={refresh}
          ></Button>
        </h2>
        <Button
          color="primary"
          variant="fill"
          disabled={selectedItems.length === 0}
          on:click={async () => {
            const filtered = $remultInfos.entities.filter(e =>
              selectedItems.includes(e.meta.table.className),
            )

            const outputDir = (await remult.repo(Setting).findId(SettingKey.outputDir)).value

            for (const element of filtered) {
              await ActionsController.writeFile(
                `${outputDir}/entities/${element.meta.table.className}.ts`,
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
            type="search"
            bind:value={search}
            placeholder="looking for a specific entity?"
          ></TextField>
        </div>
        <div class="grid gap-1 mx-2">
          <Button
            variant="outline"
            size="sm"
            color="primary"
            disabled={selectedItems.length === 0}
            on:click={() => {
              selectedItems = []
            }}
          >
            Nothing
          </Button>
          <Button
            variant="outline"
            size="sm"
            color="primary"
            disabled={selectedItems.length === sortedData.length}
            on:click={() => {
              selectedItems = sortedData.map(c => c.meta.table.className)
            }}
          >
            All
          </Button>
        </div>
      </div>
    </div>
    {#each sortedData as row}
      <div transition:slide class="m-2">
        <ListItem
          title={row.meta.table.className}
          subheading={row.meta.colsMeta.length + ' fields'}
          on:click={() => updateSelection(row.meta.table.className)}
          class={cls(
            'px-8 py-4',
            'cursor-pointer transition-shadow duration-100 border',
            'hover:bg-primary/10',
            selectedItems.includes(row.meta.table.className) ? 'bg-primary/10' : '',
          )}
          noBackground
          noShadow
        >
          <div slot="actions">
            <Checkbox
              checked={selectedItems.includes(row.meta.table.className)}
              on:change={() => updateSelection(row.meta.table.className)}
            />
          </div>
        </ListItem>
      </div>
    {/each}
  </Card>
{/if}
