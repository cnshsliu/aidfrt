<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import {
		NavLink,
		Button,
		Container,
		Row,
		Col,
		Icon,
		InputGroup,
		InputGroupText,
		Input
	} from 'sveltestrap';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Spinner from '$lib/Spinner.svelte';
	import ChangeID from './ChangeID.svelte';

	import * as api from '$lib/api';
	export let nodeInfo;
	export let showHelp;
	export let readonly;
	export let scenario;
	export let jq;
	export let KFK;
	let helpShowing = false;
	let consoleMsg = '';
	let user = $page.data.user;
	let checkingStatus = '';
	let checkingMsg = '';
	let enableRerun = false;
	onMount(async () => {
		enableRerun =
			scenario === 'workflow' &&
			KFK.theWf.status === 'ST_RUN' &&
			jq('#' + nodeInfo.nodeProps.SCRIPT.id).hasClass('ST_DONE') === true;
	});
</script>

<Container>
	<Row cols="1">
		<ChangeID
			{jq}
			bind:idForInput={nodeInfo.nodeProps.SCRIPT.id}
			{KFK}
			{readonly}
			on:changeNodeId
		/>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SCRIPT.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<Row cols="1">
		<Col class="d-flex mt-2">
			<Input
				class="ms-1"
				type="radio"
				bind:group={nodeInfo.nodeProps.SCRIPT.runmode}
				value="SYNC"
				label={$_('prop.script.syncmode')}
				disabled={readonly}
			/>
			<Input
				class="ms-1"
				type="radio"
				bind:group={nodeInfo.nodeProps.SCRIPT.runmode}
				value="ASYNC"
				label={$_('prop.script.asyncmode')}
				disabled={readonly}
			/>
		</Col>
		<Col>
			<Input
				bind:value={nodeInfo.nodeProps.SCRIPT.code}
				type="textarea"
				class="kfk-code-input"
				disabled={readonly}
			/>
		</Col>
		{#if enableRerun}
			<Button
				class="btn-warning"
				on:click={async () => {
					let ret = await api.post(
						'workflow/node/rerun',
						{ wfid: KFK.theWf.wfid, nodeid: nodeInfo.nodeProps.SCRIPT.id },
						user.sessionToken
					);
					console.log(ret);
					enableRerun = false;
				}}
			>
				Rerun This Script <br />
				(Lab Function, may cause problems)
			</Button>
		{/if}
		<Col>
			<Row class="mt-2">
				<Col>
					<div class="justify-content-begin d-flex">
						<Spinner bind:status={checkingStatus} bind:msg={checkingMsg} />
					</div>
				</Col>
				<Col>
					<div class="justify-content-end d-flex">
						<Button
							disabled={readonly}
							on:click={async (e) => {
								e.preventDefault();
								checkingStatus = 'LOADING';
								checkingMsg = '';
								let ret = await api.post(
									'code/try',
									{ code: nodeInfo.nodeProps.SCRIPT.code },
									user.sessionToken
								);
								checkingStatus = '';
								if (ret.error) {
									consoleMsg = ret.message;
								} else {
									consoleMsg = ret.message;
								}
							}}
						>
							{$_('prop.script.tryrun')}
						</Button>
					</div>
				</Col>
			</Row>
		</Col>
		{#if consoleMsg !== ''}
			<Col>
				<pre>
				<code>
					{#if consoleMsg.indexOf('Error:') > -1}
							{consoleMsg}
						{:else}
							All good
						{/if}
				</code>
			</pre>
			</Col>
		{/if}
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('SCRIPT');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0"
			>
				{#if helpShowing}
					<Icon name="chevron-left" />
					<Icon name="question-circle" />
				{:else}
					<Icon name="question-circle" />
					<Icon name="chevron-right" />
				{/if}
			</NavLink>
		</Col>
	</Row>
</Container>
