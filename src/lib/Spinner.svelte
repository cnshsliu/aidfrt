<script lang="ts">
	export let status: string;
	export let msg = '';
</script>

{#if status === 'LOADING'}
	<i class="bi bi-hypnotize input_spinning" />
{/if}
{msg}
