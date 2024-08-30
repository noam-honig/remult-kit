<script lang="ts">
  import { onMount } from 'svelte'
  import { Anchor, Node, Svelvet, ThemeToggle } from 'svelvet'

  import type { EntityMetaData } from '$lib/cli/getEntity'
  import { toPascalCase } from '$lib/cli/utils/case'
  import FieldContainer from '$lib/components/ui/FieldContainer.svelte'
  import { connectionInfo } from '$lib/stores/connectionInfoStore'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { ActionsController } from '$shared/contollers/ActionsController'

  onMount(async () => {
    $remultInfos = await ActionsController.getDbEntitiesMetadata($connectionInfo)
  })

  const calcOptimisedDefaultPlacement = (
    entities: {
      fileContent: string
      meta: EntityMetaData
    }[],
    algo: 'one' | 'two',
  ) => {
    const numColumns = 8
    const tableWidth = 800
    const rowHeight = 32
    const tableHeightSpace = 350
    const columns = Array(numColumns).fill(0) // Initialize column heights
    const maxCanvasHeight = Math.max(...columns) // Calculate the max column height
    let tablePositions: any[] = []

    // Sort entities by height (number of rows + 1 for the title)
    if (algo === 'one') {
      entities.sort((a, b) => b.meta.colsMeta.length + 1 - (a.meta.colsMeta.length + 1))
    }
    // Maybe the one with no relation should be more on the right

    let isLeft = true

    // First pass: Place tables and calculate column heights
    for (let entity of entities) {
      let tableHeight = (entity.meta.colsMeta.length + 1) * rowHeight + tableHeightSpace
      const mins = Math.min(...columns)
      let columnIndex = isLeft ? columns.indexOf(mins) : columns.lastIndexOf(mins)
      // To alterna big tables
      columns.filter((c) => c === mins).length > 1 ? (isLeft = !isLeft) : (isLeft = isLeft)

      // Store table positions temporarily
      tablePositions.push({
        entity: entity,
        columnIndex: columnIndex,
        startY: columns[columnIndex],
        height: tableHeight,
      })

      // Update column height
      columns[columnIndex] += tableHeight
    }

    // Calculate the maximum column height
    const maxColumnHeight = Math.max(...columns)

    // Second pass: Adjust y position to center tables in each column
    tablePositions.forEach((position) => {
      const columnHeight = columns[position.columnIndex]
      const extraSpace = maxColumnHeight - columnHeight
      const numTables = tablePositions.filter(
        (pos) => pos.columnIndex === position.columnIndex,
      ).length
      const extraSpacePerTable = extraSpace / (numTables + 1)
      let cumulativeExtraSpace = extraSpacePerTable

      position.entity.meta.position = {
        x: position.columnIndex * tableWidth,
        y: position.startY + cumulativeExtraSpace,
      }

      // Update cumulative extra space for next table in the same column
      cumulativeExtraSpace += extraSpacePerTable + position.height
    })

    return tablePositions.map((pos) => pos.entity)
  }

  let withRelations = true
  let algo = false
</script>

{#if $remultInfos.entities.length > 0}
  <div class="flex gap-4">
    <FieldContainer forId="withRelations" label="With Relation">
      <input id="withRelations" type="checkbox" bind:checked={withRelations} class="checkbox" />
    </FieldContainer>

    <!-- <FieldContainer forId="algo" label="Algo One or Two">
      <input id="algo" type="checkbox" bind:checked={algo} class="checkbox" />
    </FieldContainer> -->
  </div>

  <div class="h-[700px]">
    <Svelvet fitView controls minimap>
      <!-- .filter(c => c.meta.table.className === 'Site' || c.meta.table.className === 'Contrat') -->
      {#each calcOptimisedDefaultPlacement($remultInfos.entities, 'two') as { meta }, i}
        <Node useDefaults id={meta.table.className} position={meta.position}>
          <div class="">
            <div id="container">
              <table class="table table-xs">
                <tr>
                  <th colspan="3" class="rounded-t-lg bg-secondary text-center text-lg">
                    {meta.table.className}
                  </th>
                </tr>
                {#each meta.colsMeta as colMeta}
                  <tr>
                    <td>
                      {colMeta.columnName}
                    </td>
                    <td>{colMeta.isNullable === 'YES' ? '?' : ''}</td>
                    <td>
                      {colMeta.type}{colMeta.decorator}
                    </td>
                  </tr>
                {/each}
              </table>

              {#if withRelations}
                <!-- Let's add dots -->
                {#each meta.colsMeta as colMeta, i}
                  <!-- Add the id Anchor -->
                  {#if colMeta.columnName === 'id'}
                    <div class="absolute" style="top: {i * 28 + 45}px; left: -8px">
                      <Anchor id={`${colMeta.columnName}_west`} input direction="west"></Anchor>
                    </div>
                  {/if}

                  {#each meta.toManys as infront}
                    {#if infront.refField === colMeta.columnName}
                      <div class="absolute" style="top: {i * 28 + 45}px; right: -8px">
                        <Anchor
                          id={`${colMeta.columnName}_east`}
                          output
                          direction="east"
                          connections={[toPascalCase(infront.addOn), 'id_west']}
                        ></Anchor>
                      </div>
                    {/if}
                  {/each}
                {/each}
              {/if}
            </div>
          </div>
        </Node>
      {/each}
      <ThemeToggle main="dark" />
    </Svelvet>
  </div>
{/if}

<style>
  :global(:root) {
    --background-color: transparent;
  }
</style>
