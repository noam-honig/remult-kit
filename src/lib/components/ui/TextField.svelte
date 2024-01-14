<script lang="ts">
	import FieldContainer from './FieldContainer.svelte'
	export let label: string = 'label'
	export let value: any = undefined
	export let placeholder: string = ''
	export let options: { label: string; value: any }[] = []
</script>

<FieldContainer {label} forId="">
	<input type="text" {placeholder} bind:value class="input input-bordered w-full max-w-xs" />
</FieldContainer>