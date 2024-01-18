<script lang="ts">
  export let size = 1
  export let color: string | undefined = undefined
  export let flip: 'h' | 'v' | undefined = undefined
  export let rotate = 0
  export let path: string

  export { classes as class }
  let classes = ''

  // size
  if (Number(size)) size = Number(size)

  const getStyles = (
    size: number,
    color: string | undefined,
    flip: 'h' | 'v' | undefined,
    rotate: number,
  ) => {
    const transform = []
    const styles = []

    if (size !== null) {
      const width = typeof size === 'string' ? size : `${size * 1.5}rem`
      styles.push(['width', width])
      styles.push(['height', width])
    }

    styles.push(['fill', color !== null ? color : 'currentColor'])

    if (flip === 'h') {
      transform.push('scaleX(-1)')
    }

    if (flip === 'v') {
      transform.push('scaleY(-1)')
    }

    if (rotate != 0) {
      transform.push(`rotate(${rotate}deg)`)
    }

    if (transform.length > 0) {
      styles.push(['transform', transform.join(' ')])
      styles.push(['transform-origin', 'center'])
    }

    return styles.reduce((cur, item) => {
      return `${cur} ${item[0]}:${item[1]};`
    }, '')
  }

  $: style = getStyles(size, color, flip, rotate)
</script>

<svg viewBox="0 0 24 24" {style}>
  <path d={path} style="fill:currentColor" class={classes}></path>
</svg>
