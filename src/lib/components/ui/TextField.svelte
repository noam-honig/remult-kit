<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import FieldContainer from './FieldContainer.svelte'

  // eslint-disable-next-line svelte/require-event-dispatcher-types
  const dispatch = createEventDispatcher()

  export let label: string = 'label'
  export let value: any = undefined
  export let placeholder: string = ''
</script>

<FieldContainer {label} forId="">
  <input
    on:change={() => dispatch('change')}
    type="text"
    {placeholder}
    bind:value
    class="input input-bordered w-full placeholder:text-base-content/30"
  />
</FieldContainer>
