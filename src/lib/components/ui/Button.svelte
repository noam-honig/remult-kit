<script lang="ts">
  import Icon from './Icon.svelte'

  export let icon: any = undefined
  export let loading = false

  export { classes as class }
  let classes = 'btn-primary'
</script>

<button {...$$restProps} on:click class="btn {loading ? 'btn-disabled' : ''} {classes}">
  {#if icon}
    <Icon path={icon} class={loading ? 'animate-pulse' : ''}></Icon>
  {/if}
  <span class={loading ? 'animate-pulse' : ''}>
    <slot />
  </span>
</button>
