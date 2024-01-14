<script lang="ts">
  export let title = 'Card title!'
  export let subheading = ''

  export { classes as class }
  let classes = ''
</script>

<div class="card w-full bg-base-100 shadow-xl {classes}">
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    <h3 class="italic">{subheading}</h3>
    <slot />
    <!-- <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div> -->
  </div>
</div>
