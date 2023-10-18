<script lang="ts">
	import { TagStorage } from '$lib/mtcLocalStores';
	import type { PageData } from './$types';

	export let data: PageData;
	let { user } = data;
	$: ({ user } = data);
</script>

<div>
	{JSON.stringify($TagStorage)}
</div>
