<script lang="ts">
  export let title = ''
  export let subheading = ''

  export { classes as class }
  let classes = ''
</script>

<div class="card w-full bg-base-100 shadow-xl {classes} overflow-auto">
  <div class="card-body">
    {#if title}
      <h2 class="card-title">{title}</h2>
    {/if}
    {#if subheading}
      <div class="card-subtitle">{subheading}</div>
    {/if}
    <div class="overflow-auto">
      <slot />
    </div>
    <!-- <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div> -->
  </div>
</div>
