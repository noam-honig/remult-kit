<script lang="ts">
  import Icon from './Icon.svelte'

  export let icon: any = undefined
</script>

<button {...$$restProps} class="btn btn-primary">
  <div>
    <Icon path={icon}></Icon>
  </div>
  <slot />
</button>
