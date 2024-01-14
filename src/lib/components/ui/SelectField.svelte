<script lang="ts">
	import FieldContainer from './FieldContainer.svelte'
	export let label: string = 'label'
	export let value: any = undefined
	export let options: { label: string; value: any }[] = []
</script>

<FieldContainer {label} forId="">
	<select
		class="select select-bordered w-full max-w-xs"
		bind:value
		on:change
	>
		{#each options as options}
			<option value={options.value}>{options.label}</option>
		{/each}
	</select>
</FieldContainer>