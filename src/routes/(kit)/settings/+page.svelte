<script lang="ts">
  import { Setting, SettingKey } from '$shared/entities/Setting'
  import { Button, Card, TextField } from '$ui'
  import { remult } from 'remult'
  import { onMount } from 'svelte'

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
        <div class="flex gap-2 mt-2 items-center">
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
