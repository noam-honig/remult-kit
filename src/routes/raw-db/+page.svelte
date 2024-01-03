<script>
  import { Button, Card, Field } from 'svelte-ux'

  // TODO: add favorites saved in .remult-kit 🧡

  let rawDb = 'CREATE SCHEMA IF NOT EXISTS "public";'
</script>

<main class="p-2">
  <h1 class="text-lg font-semibold mb-5">Raw DB</h1>

  <Card title="SQL" subheading="Run raw queries">
    <svelte:fragment slot="contents">
      <textarea class="w-full h-96" bind:value={rawDb} />
    </svelte:fragment>
    <div slot="actions" class="m-2">
      <Button
        variant="fill"
        color="primary"
        on:click={async () => {
          console.log(`Run Raw SQL...`)
        }}>Run</Button
      >
    </div>
  </Card>
</main>
