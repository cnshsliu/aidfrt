<script lang="ts">
	import { pageName } from '$lib/Stores';
	import { _, locale } from '$lib/i18n';
	import TimeTool from '$lib/TimeTool';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import Avatar from '$lib/display/Avatar.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { filterStorage } from '$lib/mtcLocalStores';
	import { setFadeMessage } from '$lib/Notifier';
	import {
		InputGroup,
		TabContent,
		Badge,
		Fade,
		Card,
		TabPane,
		FormGroup,
		Label,
		Input,
	} from 'sveltestrap';
	import type { User } from '$lib/types';
	import { Container, Row, Col, Icon, Button, Nav, NavLink } from 'sveltestrap';
	import { createEventDispatcher, setContext } from 'svelte';
	import type { StateContext } from '$lib/types';
	import Pagination from '$lib/pagination/Pagination.svelte';
	let pageSer = 0;
	let pageSize = 20;

	setContext('state', {
		getState: () => ({
			pageSer,
			pageSize,
		}),
		setPage: (_pageSer) => {
			pageSer = _pageSer;
		},
	} as StateContext);

	let categoryPicked = 'I_AM_QED';
	let payload = { category: ['I_AM_QED'], pageSer: 0, pageSize: pageSize, q: '' };
	let categories = [
		{ key: 'ALL_VISIED', display: $_('discuss.category.ALL_VISIED'), checked: false },
		{ key: 'I_STARTED', display: $_('discuss.category.I_STARTED'), checked: false },
		{ key: 'I_AM_IN', display: $_('discuss.category.I_AM_IN'), checked: false },
		{ key: 'I_AM_QED', display: $_('discuss.category.I_AM_QED'), checked: true },
	];

	let total = 0;
	let comments = [];
	let loading = false;
	let errMsg = '';
	let q = '';

	const onCategoryChange = (e) => {
		e && e.preventDefault();
		payload.category = [e.currentTarget.value];
		reload(null);
	};

	const reload = async (e = null) => {
		e && e.preventDefault();
		loading = true;
		q = q.trim();
		payload.q = q;
		let ret = await api.post('comment/search', payload, $page.data.token);
		loading = false;
		if (ret.error) {
			errMsg = ret.message;
		} else {
			errMsg = '';
			total = ret.total;
			comments = ret.cmts;
		}
	};
	const onPageChange = (event) => {
		//dispatch('pageChange', event.detail);
		console.log('Page chagne to ', event.detail);
		payload.pageSer = event.detail.pageSer;
		reload(null);
	};
	onMount(() => {
		$pageName = $_('navmenu.discuss');
		TimeTool.setLocale($locale);
		reload(null);
	});
	const onSearch = (e) => {
		e.preventDefault();
		console.log(q);
		reload(null);
	};
</script>

<Container class="mt-1 kfk-result-list">
	<Row>
		{#each categories as cate}
			<Col class="pt-2">
				<div class="form-check">
					<input
						class="form-check-input"
						type="radio"
						name="flexRadioDefault"
						value={cate.key}
						id={'cate_' + cate.key}
						checked={payload.category[0] === cate.key}
						on:change={onCategoryChange} />
					<label
						class="form-check-label"
						for={'cate_' + cate.key}>
						{cate.display}
					</label>
				</div>
			</Col>
		{/each}
		<Col>
			<Button on:click={reload}>{$_('discuss.reload')}</Button>
		</Col>
	</Row>
	<Row class="w-100">
		<Col class="w-100">
			<InputGroup>
				<div class="form-input">
					<Input
						class="form-input"
						name="searchq"
						bind:value={q}
						id="searchq"
						placeholder="Search here" />
				</div>
				<Button on:click={onSearch}><i class="bi bi-search" /></Button>
			</InputGroup>
		</Col>
	</Row>

	{#if errMsg}
		{errMsg}
	{/if}
	{#if loading}
		<Container
			class="w-100 text-center "
			style="height:100px;">
			<div class="runninglogo w-100">&nbsp;</div>
		</Container>
	{:else}
		<div class="slot-top">
			<Pagination
				{pageSer}
				{pageSize}
				count={total}
				on:pageChange={onPageChange} />
		</div>
		{#each comments as cmt, cmtIndex}
			<Row
				id={'tcmt_' + cmt._id}
				class="mt-2 bt-2">
				<Col class="d-flex col-auto">
					<Avatar
						eid={cmt.who}
						uname={cmt.whoCN}
						style={'avatar50-round25'} />
				</Col>
				<Col>
					<Row>
						<Col class="col-auto">
							<span class="fw-bold me-2">
								{cmt.whoCN}({cmt.who})
							</span>
						</Col>
					</Row>
					<Row>
						<Col class="fs-6 kfk-tag fw-bolder">
							{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
							{#if cmt.context?.wfid}
								{$_('comment.fortodo')}
								<a
									href={`/work/${cmt.context.todoid}`}
									role="button">
									{cmt.context.biztitle ?? cmt.todoTitle ?? cmt.context.wfid}
								</a>
							{/if}
						</Col>
					</Row>
				</Col>
			</Row>
			<Row
				cols="1"
				class="ms-3 border-start border-primary">
				<Col>
					<div class="ms-5">
						{@html cmt.mdcontent2}
					</div>
				</Col>
			</Row>
			<div class="ms-3 border-start border-primary comment-input row row-cols-1">
				<div class="col px-5 pb-2 text-primary">
					<span class="kfk-tag">
						{#if cmt.upnum > 0}
							<AniIcon
								icon="hand-thumbs-up-fill"
								ani="aniShake" />
						{:else}
							<AniIcon
								icon="hand-thumbs-up"
								ani="aniShake" />
						{/if}
						{cmt.upnum}
					</span>
					<span class="kfk-tag">
						{#if cmt.downnum > 0}
							<AniIcon
								icon="hand-thumbs-down-fill"
								ani="aniShake" />
						{:else}
							<AniIcon
								icon="hand-thumbs-down"
								ani="aniShake" />
						{/if}
						{cmt.downnum}
					</span>
					<span class="kfk-tag ms-3">
						<a
							href={'#'}
							class="kfk-link px-2 fw-bolder"
							on:click|preventDefault={(e) => {
								goto(`/workflow/${cmt.context.wfid}?showComment=true`);
							}}>
							进入流程讨论详情
						</a>
					</span>
				</div>
				<div class="col px-5 pb-2">
					{cmt.latestReply.length > 0 ? '最新消息' : '尚未有回复'}
					{#each cmt.latestReply as reply, replyIndex}
						<Row
							id={'tcmtreply_' + reply._id}
							class="mt-2 bt-2">
							<Col class="d-flex col-auto">
								<Avatar
									eid={reply.who}
									uname={reply.whoCN}
									style={'avatar50-round25'} />
							</Col>
							<Col>
								<Row>
									<Col class="col-auto">
										<span class="fw-bold me-2">
											{reply.whoCN}({reply.who})
										</span>
									</Col>
								</Row>
								<Row>
									<Col class="fs-6 kfk-tag fw-bolder">
										{TimeTool ? TimeTool.fromNow(reply.createdAt) : ''}
									</Col>
								</Row>
							</Col>
						</Row>
						<Row
							cols="1"
							class="ms-3 border-start border-primary">
							<Col>
								<div class="ms-5">
									{@html reply.mdcontent2}
								</div>
							</Col>
						</Row>
					{/each}
				</div>
			</div>
		{/each}
		<div class="slot-bottom">
			<Pagination
				{pageSer}
				{pageSize}
				count={total}
				on:pageChange={onPageChange} />
		</div>
	{/if}
</Container>

<style>
	.slot-top,
	.slot-bottom {
		float: left;
		width: 100%;
		margin-top: 1em;
	}
</style>
