<script lang="ts">
  import { page } from '$app/stores'
  // import { AppBar, AppLayout, Button, NavItem, settings, ThemeSelect, Tooltip } from 'svelte-ux'
  import '../app.postcss'
  import {
    mdiCog,
    mdiDatabaseEditOutline,
    mdiGithub,
    mdiHome,
    mdiLayersTripleOutline,
    mdiTwitter,
    mdiVectorLink,
  } from '@mdi/js'
  import logo from '$lib/assets/remult-kit.png'
  import Icon from '$lib/components/ui/Icon.svelte'

  const links = [
    { text: 'Home', path: '/', icon: mdiHome },
    { text: 'Entities', path: '/entities', icon: mdiLayersTripleOutline },
    { text: 'Schemas', path: '/schemas', icon: mdiVectorLink },
    { text: 'Raw DB', path: '/raw-db', icon: mdiDatabaseEditOutline },
    { text: 'Settings', path: '/settings', icon: mdiCog },
  ]
</script>

<svelte:head>
  <link rel="icon" href={logo} />

  <title>Remult Kit</title>

  <script
    src="https://cdn.jsdelivr.net/npm/external-svg-loader@1.6.10/svg-loader.min.js"
    async
  ></script>
</svelte:head>

<div class="drawer min-h-screen bg-base-200 lg:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <!-- content -->
  <main class="drawer-content">
    <div class="grid grid-cols-12 grid-rows-[min-content] gap-y-12 p-4 lg:gap-x-12 lg:p-10">
      <!-- header -->
      <header class="col-span-12 flex items-center gap-2 lg:gap-4">
        <label for="my-drawer" class="btn btn-square btn-ghost drawer-button lg:hidden">
          <svg data-src="https://unpkg.com/heroicons/20/solid/bars-3.svg" class="h-5 w-5"></svg>
        </label>
        <div class="grow">
          <h1 class="lg:text-2xl lg:font-light">Remult Kit</h1>
        </div>
        <!-- <div>
          <input type="text" placeholder="Search" class="input input-sm rounded-full max-sm:w-24" />
        </div> -->

        <a target="_blank" href="https://github.com/remult/remult">
          <Icon path={mdiGithub} />
        </a>
        <a target="_blank" href="https://twitter.com/RemultJs">
          <Icon path={mdiTwitter} />
        </a>
      </header>
      <!-- /header -->

      <!-- stats -->
      <div class="col-span-12">
        <slot />
      </div>
      <!-- /stats -->
    </div>
  </main>
  <!-- /content -->
  <aside class="drawer-side z-10">
    <label for="my-drawer" class="drawer-overlay"></label>
    <!-- sidebar menu -->
    <nav class="flex min-h-screen w-72 flex-col gap-2 overflow-y-auto bg-base-100 px-6 py-10">
      <div class="mx-4 flex items-center justify-evenly gap-6 font-black">
        <svg
          class="w-10 h-10"
          width="119"
          height="103"
          viewBox="0 0 119 103"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M61.4093 37.0801C61.2531 36.9239 60.7533 35.6223 60.5971 35.2995C44.1451 1.5 7.37801 2.63498 1.57816 17.8375C-2.94094 29.4788 16.5724 57.1348 61.4093 37.0801Z"
            fill="url(#paint0_linear_83_7529)"
          />
          <path
            d="M68.8335 33.9979C94.1363 22.6898 90.596 3.12437 83.9839 0.531621C75.2685 -2.86291 59.1498 10.2362 68.3441 33.0295C68.5107 33.1961 68.8335 33.8417 68.8335 33.9979Z"
            fill="url(#paint1_linear_83_7529)"
          />
          <path
            d="M44.6449 64.4654C39.9696 71.7438 36.4189 79.1784 33.9928 84.5201C33.8366 84.8429 33.8366 85.0095 33.6804 85.3323C32.8682 87.4357 32.056 89.0496 31.577 90.5074C30.9314 92.1214 31.7332 94.0685 33.5138 94.7037C34.7945 95.1931 36.5751 95.8387 38.6785 96.6509C38.9908 96.8071 39.1574 96.8071 39.4802 96.9633C45.1239 98.9 52.8709 101.003 61.2531 102.461C56.255 97.6193 52.2149 91.7778 49.3098 85.3219C46.4047 78.6995 44.7907 71.5876 44.6345 64.4654H44.6449Z"
            fill="url(#paint2_linear_83_7529)"
          />
          <path
            d="M115.43 55.5729C111.567 47.0033 104.622 40.7037 96.4062 37.7881C95.6045 37.4757 94.7923 37.3091 93.8239 37.3091C89.6276 37.3091 85.4417 40.8703 85.1189 45.2332C84.4733 52.6678 85.9311 60.1025 89.1486 67.3809C92.3661 74.5032 96.8852 80.48 102.539 84.9991C103.997 86.1341 105.923 86.6131 107.694 86.6131C111.088 86.6131 114.306 84.8429 115.597 81.7608C119.137 73.8263 119.304 64.2883 115.43 55.5521V55.5729Z"
            fill="url(#paint3_linear_83_7529)"
          />
          <path
            d="M79.621 71.9104C75.5913 62.8514 73.9774 53.6362 74.7896 44.5772C74.9458 41.9948 75.7579 39.5687 76.8825 37.4653C76.7263 37.4653 76.4035 37.6215 76.2369 37.6215C75.9141 37.7881 75.4352 37.7881 75.1124 37.9443C72.6862 38.5899 70.2809 39.7249 68.1775 40.8599C67.053 41.5159 66.0846 42.1614 64.96 42.807C59.483 46.5243 54.9639 52.9906 54.3183 59.7901C53.6623 67.0685 54.9639 74.5032 58.0252 81.615C61.0969 88.5706 65.6056 94.2351 71.0931 98.598C74.4772 101.347 80.4436 102.971 85.4521 102.971C90.9292 102.971 96.729 100.868 101.415 97.9525C101.415 97.9525 101.581 97.9525 101.581 97.7963C101.894 97.6297 102.227 97.3069 102.55 97.1403C102.706 96.9841 102.862 96.8279 103.029 96.8279C100.446 96.1719 98.1972 95.0473 96.2605 93.5791C89.1694 88.0813 83.5258 80.8028 79.6419 71.9104H79.621Z"
            fill="url(#paint4_linear_83_7529)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_83_7529"
              x1="7.71012"
              y1="10.4132"
              x2="126.935"
              y2="103.086"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#5B68DF" />
              <stop offset="1" stop-color="#FCB336" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_83_7529"
              x1="7.71012"
              y1="10.4132"
              x2="126.935"
              y2="103.086"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#5B68DF" />
              <stop offset="1" stop-color="#FCB336" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_83_7529"
              x1="7.71012"
              y1="10.4132"
              x2="126.935"
              y2="103.086"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#5B68DF" />
              <stop offset="1" stop-color="#FCB336" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_83_7529"
              x1="7.71012"
              y1="10.4132"
              x2="126.935"
              y2="103.086"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#5B68DF" />
              <stop offset="1" stop-color="#FCB336" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_83_7529"
              x1="7.71012"
              y1="10.4132"
              x2="126.935"
              y2="103.086"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#5B68DF" />
              <stop offset="1" stop-color="#FCB336" />
            </linearGradient>
          </defs>
        </svg>

        <div class="text-primary">Remult Kit</div>
      </div>
      <ul class="menu">
        {#each links as link}
          <li>
            <a
              class="flex items-center gap-2 p-2 rounded-md hover:bg-base-200"
              class:active={$page.url.pathname === link.path}
              href={link.path}
            >
              <Icon path={link.icon} />
              {link.text}
            </a>
          </li>
        {/each}
        <!-- <NavItem path="/" text="Home" icon={mdiHome} currentUrl={$page.url} />
        <NavItem
          path="/entities"
          text="Entities"
          icon={mdiLayersTripleOutline}
          currentUrl={$page.url}
        />
        <NavItem path="/schemas" text="Schemas" icon={mdiVectorLink} currentUrl={$page.url} />
        <NavItem path="/raw-db" text="Raw DB" icon={mdiDatabaseEditOutline} currentUrl={$page.url} />
        <div></div>
        <NavItem path="/settings" text="Settings" icon={mdiCog} currentUrl={$page.url} />
        <NavItem path="/about" text="About" icon={mdiInformationOutline} currentUrl={$page.url} /> -->
      </ul>
    </nav>
    <!-- /sidebar menu -->
  </aside>
</div>

<!-- <AppLayout>
  <nav slot="nav" class="nav overflow-hidden grid gap-2 py-2">
    <NavItem path="/" text="Home" icon={mdiHome} currentUrl={$page.url} />
    <NavItem
      path="/entities"
      text="Entities"
      icon={mdiLayersTripleOutline}
      currentUrl={$page.url}
    />
    <NavItem path="/schemas" text="Schemas" icon={mdiVectorLink} currentUrl={$page.url} />
    <NavItem path="/raw-db" text="Raw DB" icon={mdiDatabaseEditOutline} currentUrl={$page.url} />
    <div></div>
    <NavItem path="/settings" text="Settings" icon={mdiCog} currentUrl={$page.url} />
    <NavItem path="/about" text="About" icon={mdiInformationOutline} currentUrl={$page.url} />
  </nav>

  <AppBar title="Remult Kit">
    <div slot="actions" class="flex gap-3">
      <ThemeSelect></ThemeSelect>

      <Tooltip title="Discord" placement="left" offset={2}>
        <Button
          icon="M20.33 5.06C18.78 4.33 17.12 3.8 15.38 3.5 15.17 3.89 14.92 4.4 14.74 4.82 12.9 4.54 11.07 4.54 9.26 4.82 9.09 4.4 8.83 3.89 8.62 3.5 6.88 3.8 5.21 4.33 3.66 5.06 0.53 9.79-0.32 14.41 0.1 18.96 2.18 20.52 4.19 21.46 6.17 22.08 6.66 21.4 7.1 20.69 7.48 19.93 6.76 19.66 6.07 19.33 5.43 18.94 5.6 18.81 5.77 18.68 5.93 18.54 9.88 20.39 14.17 20.39 18.07 18.54 18.23 18.68 18.4 18.81 18.57 18.94 17.92 19.33 17.24 19.66 16.52 19.94 16.9 20.69 17.33 21.41 17.82 22.08 19.8 21.46 21.82 20.52 23.9 18.96 24.4 13.69 23.05 9.11 20.33 5.06ZM8.01 16.17C6.83 16.17 5.86 15.06 5.86 13.71 5.86 12.36 6.81 11.25 8.01 11.25 9.22 11.25 10.19 12.36 10.17 13.71 10.17 15.06 9.22 16.17 8.01 16.17ZM15.99 16.17C14.8 16.17 13.83 15.06 13.83 13.71 13.83 12.36 14.78 11.25 15.99 11.25 17.19 11.25 18.17 12.36 18.14 13.71 18.14 15.06 17.19 16.17 15.99 16.17Z"
          href="https://discord.gg/GXHk7ZfuG5"
          class="p-2 border-0 bg-transparent"
          target="_blank"
        />
      </Tooltip>

      <Tooltip title="Open Twitter / X" placement="left" offset={2}>
        <Button
          icon="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"
          href="https://twitter.com/RemultJs"
          class="p-2 border-0 bg-transparent"
          target="_blank"
        />
      </Tooltip>

      <Tooltip title="View repository" placement="left" offset={2}>
        <Button
          icon="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
          href="https://github.com/remult/remult"
          class="p-2 border-0 bg-transparent"
          target="_blank"
        />
      </Tooltip>
    </div>
  </AppBar>

  <main class="p-2">
    <slot />
  </main>
</AppLayout> -->
