<script lang="ts">
  import Icon from './Icon.svelte'

  export let icon: any = undefined

  export { classes as class }
  let classes = 'btn-primary'
</script>

<button {...$$restProps} on:click class="btn {classes}">
  {#if icon}
    <Icon path={icon}></Icon>
  {/if}
  <slot />
</button>
