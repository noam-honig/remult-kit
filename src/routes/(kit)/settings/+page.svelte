<script lang="ts">
  import { onMount } from 'svelte'

  import { remult } from 'remult'

  import { Setting, SettingKey } from '$shared/entities/Setting'
  import { Button, Card, TextField } from '$ui'

  let settings: Setting[] = []

  onMount(async () => {
    settings = await remult.repo(Setting).find()
  })
</script>

<Card title="Basics">
  {#each settings as setting}
    <div>
      <TextField
        label={setting.id}
        bind:value={setting.value}
        on:change={() => {
          remult.repo(Setting).save(setting)
        }}
      ></TextField>
      {#if setting.id === SettingKey.tableProps}
        <div class="mt-2 flex items-center gap-2">
          <i class="text-xs">Presets:</i>
          {#each ['allowApiCrud: false', 'allowApiCrud: true', 'allowApiCrud: Allow.authenticated', 'allowApiCrud: "admin"'] as preset}
            <Button
              class="btn-outline"
              on:click={() => {
                setting.value = preset
                remult.repo(Setting).save(setting)
              }}
            >
              {preset}</Button
            >
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</Card>
