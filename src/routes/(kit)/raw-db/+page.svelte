<script>
  import { confetti } from '@neoconfetti/svelte'
  import { Button, Card } from '$ui'
  import { tick } from 'svelte'

  // TODO: add favorites saved in .remult-kit 🧡

  let isVisible = false

  let rawDb = `-- example of query  
CREATE SCHEMA IF NOT EXISTS "public";`
</script>

<Card title="SQL" subheading="Run raw queries">
  <textarea class="input input-bordered w-full h-96" bind:value={rawDb} />

  <Button
    on:click={async () => {
      console.info(`Run Raw SQL..., yes it's a todo...`)

      isVisible = false
      await tick()
      isVisible = true
    }}
    >Run
    {#if isVisible}
      <div use:confetti={{ stageWidth: 600, stageHeight: 300, force: 1 }} />
    {/if}
  </Button>
</Card>
