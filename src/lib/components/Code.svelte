<script lang="ts">
  import { mdiContentCopy } from '@mdi/js'
  import { Highlight } from 'svelte-highlight'
  import typescript from 'svelte-highlight/languages/typescript'
  import atomOneDark from 'svelte-highlight/styles/atom-one-dark'

  import { Button } from '$ui'

  export let code: string = ''

  function clip(_value: string) {
    if (_value) {
      navigator.clipboard.writeText(_value)
    }
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line -->
  {@html atomOneDark}
</svelte:head>

<div class="m-5 border border-accent">
  <div class="indicator w-full">
    <span class="indicator-item">
      <Button
        class="btn-circle  btn-secondary cursor-copy"
        on:click={() => clip(code)}
        icon={mdiContentCopy}
      ></Button>
    </span>
    <div class="grid w-full bg-base-300">
      <Highlight language={typescript} code={code ?? ''} class="overflow-x-auto" />
    </div>
  </div>
</div>
