<script lang="ts">
	import { _ } from '$lib/i18n';
	import { filterStorage } from '$lib/mtcLocalStores';
	import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'sveltestrap';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let pageSize = 10;
	let tmp = $filterStorage.pageSize;
	if (![10, 20, 50, 100].includes(tmp)) {
		$filterStorage.pageSize = pageSize;
	} else {
		pageSize = $filterStorage.pageSize;
	}
</script>

<Dropdown class="m-0 p-0">
	<DropdownToggle caret color="notexist" class="btn-sm">
		{$_('remotetable.rowperpage')}
	</DropdownToggle>
	<DropdownMenu>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={async () => {
					$filterStorage.pageSize = 10;
					dispatch('pagesize', 10);
				}}
			>
				{$_('remotetable.rows-10')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={async () => {
					$filterStorage.pageSize = 20;
					dispatch('pagesize', 20);
				}}
			>
				{$_('remotetable.rows-20')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={async () => {
					$filterStorage.pageSize = 50;
					dispatch('pagesize', 50);
				}}
			>
				{$_('remotetable.rows-50')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={async () => {
					$filterStorage.pageSize = 100;
					dispatch('pagesize', 100);
				}}
			>
				{$_('remotetable.rows-100')}
			</a>
		</DropdownItem>
	</DropdownMenu>
</Dropdown>
