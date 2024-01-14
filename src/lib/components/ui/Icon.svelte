<script lang="ts">
  import { mdiGithub, mdiTwitter } from '@mdi/js'
  // @ts-ignore
  import Icon from 'mdi-svelte'

  export let path: any | undefined = undefined
  export let name: keyof typeof icons | undefined = undefined

  let icons = {
    twitter: mdiTwitter,
    github: mdiGithub,
  } as const
</script>

{#if path}
  <Icon {path} />
{:else if name}
  <Icon path={icons[name]} />
{/if}
