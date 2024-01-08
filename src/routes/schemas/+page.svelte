<script lang="ts">
  import type { EntityMetaData } from '$lib/cli/getEntity'
  import { remultInfos } from '$lib/stores/remultInfos'
  import { onMount } from 'svelte'
  import { Anchor, Node, Svelvet, ThemeToggle } from 'svelvet'
  import { ActionsController } from '../../hooks/contollers/ActionsController'
  import { load } from '../../lib/cli/db/databases'

  onMount(async () => {
    $remultInfos = await ActionsController.check(load())
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold">Schemas</h1>

  <br />

  {#if $remultInfos.entities.length > 0}
    <div class="h-[700px]">
      <Svelvet fitView controls minimap>
        {#each $remultInfos.entities as { meta }, i}
          <Node
            useDefaults
            id={meta.table.className}
            position={{ x: 500 * (i % 5), y: 300 * Math.floor(i / 5) }}
          >
            <div class="nodeWrapper">
              {#each meta.toManys as toMany}
                <!-- <Anchor
              id={`${key}_${toMany.addOn}`}
              connections={[[key, toMany.addOn]]}
              input
              direction="west"
            ></Anchor> -->
                <!-- <div class="p_1">
            </div> -->
              {/each}
              <!-- <div class="p_1">
            <Anchor
              id="pilots_anchor1"
              connections={[['people', 'people_anchor1']]}
              input
              direction="west"
            ></Anchor>
          </div>
          <div class="p_2">
            <Anchor
              id="pilots_anchor2"
              connections={[['vessel', 'vessel_anchor1']]}
              input
              direction="west"
            ></Anchor>
          </div> -->
              <div id="container">
                <div id="heading">{meta.table.className}</div>
                <table id="pilotTable">
                  {#each meta.colsMeta as colMeta}
                    <tr>
                      <td>{colMeta.columnName}</td>
                      <td>{colMeta.type}</td>
                      <td>{colMeta.isNullable === 'YES' ? 'nullable' : ''}</td>
                      <!-- <td>{colMeta. ? 'null' : 'not null'}</td> -->
                    </tr>
                  {/each}
                  <!-- <tr>
                <td>id</td>
                <td>bigint</td>
                <td>autoincrement()</td>
              </tr>
              <tr>
                <td>person_id</td>
                <td>bigint</td>
                <td>not null</td>
              </tr>
              <tr>
                <td>vessel_id</td>
                <td>bigint</td>
                <td>not null</td>
              </tr> -->
                </table>
              </div>
            </div>
          </Node>
        {/each}
        <ThemeToggle main="dark" alt="light" slot="toggle" />
      </Svelvet>
    </div>
  {/if}
</main>

<style>
  .nodeWrapper {
    box-sizing: border-box;
    width: fit-content;
    border-radius: 8px;
    height: fit-content;
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    padding: 1px;
    gap: 10px;
  }

  .p_1 {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
    top: 83px;
    left: -16px;
  }
  .p_2 {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
    top: 123px;
    left: -16px;
  }

  #heading {
    display: flex;
    justify-content: center;
    background-color: rgb(247, 108, 108);
    padding: 10px;
    font-size: 18px;
    font-weight: 600;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
  }

  #pilotTable td {
    width: 70px;
    margin: 0px;
    padding: 8px;
    justify-content: space-evenly;
    border-bottom: 1px solid gray;
    border-right: 1px solid gray;
  }

  #pilotTable td:last-child {
    border-right: none;
  }
</style>
