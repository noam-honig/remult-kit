<script lang="ts">
  export let title = ''
  export let subheading = ''

  export { classes as class }
  let classes = ''
</script>

<div class="w-full rounded-lg bg-base-100 shadow-xl {classes} overflow-auto">
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
    <!-- <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div> -->
  </div>
</div>
