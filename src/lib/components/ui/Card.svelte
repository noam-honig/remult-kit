<script lang="ts">
  export let title = ''
  export let subheading = ''

  export { classes as class }
  let classes = ''
</script>

<!-- <div class="bg-base-300 w-full rounded-lg shadow-xl {classes} overflow-auto">
  <div class="rounded-md p-2">
    {#if !$$slots.title}
      {#if title}
        <h2 class="card-title">{title}</h2>
      {/if}
      {#if subheading}
        <div class="italic">{subheading}</div>
      {/if}
    {:else}
      <slot name="title" />
    {/if}

    {#if $$slots.default}
      <slot />
    {/if}
  </div>
</div> -->

<div class="bg-base-300 collapse-arrow border-base-300 collapse border {classes}">
  <input type="checkbox" on:abort={(e) => e.preventDefault()} />
  <div class="collapse-title pe-4 ps-12 font-semibold after:end-auto after:start-5">
    {#if !$$slots.title}
      {#if title}
        <h2 class="card-title">{title}</h2>
      {/if}
      {#if subheading}
        <div class="italic">{subheading}</div>
      {/if}
    {:else}
      <slot name="title" />
    {/if}
  </div>
  <div class="collapse-content text-sm">
    {#if $$slots.default}
      <slot />
    {/if}
  </div>
</div>
