<script lang="ts">
  import { page } from '$app/stores'

  import '../../app.postcss'

  import { mdiCog, mdiGithub, mdiHome, mdiTwitter } from '@mdi/js'

  import logo from '$lib/assets/remult-kit.png'
  import remult_kit from '$lib/assets/remult-kit.png'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { route } from '$lib/ROUTES'

  const links = [
    { text: 'Home', path: route('/'), icon: mdiHome },
    { text: 'Settings', path: route('/settings'), icon: mdiCog },
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
          <img class="h-10 w-10" src={remult_kit} alt="logo" />
        </label>
        <div class="grow">
          <h1 class="lg:text-2xl lg:font-light">
            {links.find((c) => c.path === $page.url.pathname)?.text ??
              $page.url.pathname.replace('/', '')}
          </h1>
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
        <img class="h-10 w-10" src={remult_kit} alt="logo" />

        <div class="text-primary">Remult Kit</div>
      </div>
      <ul class="menu">
        {#each links as link (link.path)}
          <li>
            <a
              class="flex items-center gap-2 rounded-md p-2 hover:bg-base-200"
              class:active={$page.url.pathname === link.path}
              href={link.path}
            >
              <Icon path={link.icon} />
              {link.text}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    <!-- /sidebar menu -->
  </aside>
</div>
