import themes from '../../themes.json'

export async function load() {
  /**
   * TMP from https://github.com/techniq/svelte-ux/blob/next/packages/svelte-ux/src/lib/styles/theme.ts#L49
   * Get themes names split into light and dark collections determined by `color-scheme` property
   */
  function getThemeNames(themes: Record<string, any>) {
    const light: string[] = []
    const dark: string[] = []

    Object.entries(themes).map(([themeName, props]) => {
      if (props['color-scheme'] === 'dark') {
        dark.push(themeName)
      } else {
        light.push(themeName)
      }
    })

    return { light, dark }
  }

  return {
    themes: getThemeNames(themes),
  }
}
