<script lang="ts">
  export let label: string = 'label'
  export let forId: string
  export let required = false
  export let error: string = ''
</script>

<div class="form-control w-full">
  <label for={forId} class="label gap-1 px-2 pb-1">
    <span class="label-text pl-2 text-xs text-base-content/60">
      {label}{required ? ' *' : ''}
    </span>
    {#if error}
      <!-- TODO hover popup is too long? -->
      <span class="label-text-alt truncate text-error">{error}</span>
    {/if}
  </label>
  <div class="h-12">
    <slot />
  </div>
</div>
