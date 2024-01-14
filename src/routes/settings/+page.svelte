<script lang="ts">
  import { remult } from 'remult'
  import { onMount } from 'svelte'
  // import { Button, Card, Collapse, Icon, TextField } from 'svelte-ux'
  import { Setting } from '../../hooks/entities/Setting'

  let settings: Setting[] = []

  onMount(async () => {
    settings = await remult.repo(Setting).find()
  })
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold mb-5">Setup</h1>

  <!-- <Collapse
    popout
    class="bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b"
  >
    <div slot="trigger" class="flex-1 px-3 py-3">
      <Icon data={mdiCheckboxMarkedOutline}></Icon> settings
    </div>
    <div class="p-3 bg-surface-300 border-t">
      <Card title="remult-kit" subheading="settings">
        <div slot="contents" class="mb-2 grid gap-2">
          {#each settings as setting}
            <div>
              <TextField
                label={setting.id}
                bind:value={setting.value}
                on:change={async () => {
                  remult.repo(Setting).save(setting)
                }}
              ></TextField>
              {#if setting.id === SettingKey.tableProps}
                <i class="text-xs">Presets:</i>
                {#each ['allowApiCrud: false', 'allowApiCrud: true', 'allowApiCrud: Allow.authenticated', 'allowApiCrud: "admin"'] as preset}
                  <Button
                    on:click={() => {
                      setting.value = preset
                      remult.repo(Setting).save(setting)
                    }}
                  >
                    {preset}</Button
                  >
                {/each}
              {/if}
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </Collapse> -->
</main>
