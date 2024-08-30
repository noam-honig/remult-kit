<script>
  import { confetti } from '@neoconfetti/svelte'
  import { tick } from 'svelte'

  import { Button, Card } from '$ui'

  // TODO: add favorites saved in .remult-kit 🧡

  let isVisible = false

  let rawDb = `-- example of query  
CREATE SCHEMA IF NOT EXISTS "public";`
</script>

<Card title="SQL" subheading="Run raw queries">
  {#if isVisible}
    <center>
      <div use:confetti={{ stageWidth: 600, stageHeight: 300, force: 1 }} />
    </center>
  {/if}
  <textarea class="input input-bordered h-96 w-full" bind:value={rawDb} />

  <Button
    on:click={async () => {
      console.info(`Run Raw SQL..., yes it's a todo...`)

      isVisible = false
      await tick()
      isVisible = true
    }}
    >Run
  </Button>
</Card>
