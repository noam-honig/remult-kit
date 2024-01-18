<script lang="ts">
  import FieldContainer from './FieldContainer.svelte'

  export let label: string = 'label'
  export let value: any = undefined
  export let placeholder: string = ''
</script>

<FieldContainer {label} forId="">
  <input
    type="text"
    {placeholder}
    bind:value
    class="input input-bordered w-full placeholder:text-base-content/30"
  />
</FieldContainer>
