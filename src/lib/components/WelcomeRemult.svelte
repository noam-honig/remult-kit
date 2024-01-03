<script>
  import { cls, Gooey, timerStore } from 'svelte-ux'
  import { circIn, circOut } from 'svelte/easing'
  import { blur } from 'svelte/transition'

  const indexTimer = timerStore({
    initial: 0,
    delay: 1200,
    onTick: value => (value ?? 0) + 1,
  })
</script>

<Gooey blur={4} alphaPixel={255} alphaShift={-144}>
  {@const words = ['Welcome', 'to', 'Remult-Kit', '⭐️']}
  <div
    class={cls('grid grid-stack place-items-center', 'w-[500px] text-8xl text-center font-bold')}
  >
    {#key $indexTimer}
      <span
        in:blur={{ amount: '10px', duration: 1000, easing: circOut }}
        out:blur={{ amount: '100px', duration: 1000, easing: circIn }}
      >
        {words[($indexTimer ?? 0) % words.length]}
      </span>
    {/key}
  </div>
</Gooey>
