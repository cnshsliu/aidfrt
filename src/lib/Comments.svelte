<script lang="ts">
	import TimeTool from '$lib/TimeTool';
	import { _, locale } from '$lib/i18n';
	import Avatar from '$lib/display/Avatar.svelte';
	import { slide, fade, blur } from 'svelte/transition';
	import Transition from '$lib/Transition.svelte';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Row, Col } from 'sveltestrap';
	import CommentInput from '$lib/input/CommentInput.svelte';

	type CommentType = {
		_id: string;
		upnum: number;
		downnum: number;
		transition: boolean;
		who: string;
		whoCN: string;
		showChildren: boolean;
		children: CommentType[];
		createdAt: string;
		todoTitle: string;
		context: { todoid: string; biztitle?: string; wfid?: string };
		todoDoerCN: string;
		objtype: string;
		objid: string;
		towhomCN: string;
		mdcontent2: string;
		reply: string;
		threadid: string;
	};

	export let comments: CommentType[];
	export let pointToOrigin: string;
	let replyToCmtId: string;
	let thumbnum_changed = 0;
	let user = $page.data.user;

	onMount(async () => {});
	const thumb = (e: Event, cmt: CommentType, direction: string) => {
		e.preventDefault();
		api
			.post('comment/thumb', { cmtid: cmt._id, thumb: direction }, user.sessionToken)
			.then((res) => {
				if (res.error) {
				} else {
					console.log(res);
					thumbnum_changed += 1;
					cmt.upnum = res.upnum;
					cmt.downnum = res.downnum;
				}
			});
	};
</script>

{#each comments as cmt, cmtIndex}
	<Transition effect={slide} enable={cmt.transition}>
		<div id={'tcmt_' + cmt._id} class="d-flex bd-highlight">
			<div class="p-0  position-relative " style="width:60px">
				<div class="position-absolute top-0 start-0 pt-2">
					<Avatar
						eid={cmt.who}
						uname={cmt.whoCN}
						style={pointToOrigin === cmt._id ? 'avatar50-round25-highlight' : 'avatar50-round25'} />
				</div>
				<img
					src="/images/leftpointer.png"
					style="position:absolute; left:52px; top:20px; height:16px;"
					alt="leftpointer" />
				<div class="h-100 pt-3">
					<div class="h-100 ms-4 border-start border-1 border-primary">&nbsp;</div>
				</div>
			</div>
			<div class="p-2 mb-2 flex-grow-1 border border-1 rounded-3">
				<Row>
					{#key pointToOrigin}
						<Col class="cmt-header">
							<Row>
								<Col class="col-auto">
									<span class="fw-bold me-2">
										{cmt.whoCN}({cmt.who})
									</span>
									{#if cmt.children && cmt.children && cmt.children.length}
										<span class="ms-3">
											<a
												class="kfk-link px-2"
												href={'#'}
												on:click|preventDefault={(e) => {
													cmt.showChildren = !cmt.showChildren;
												}}>
												{#if cmt.showChildren}
													<AniIcon icon="caret-up" ani="aniShake" />
												{:else}
													<AniIcon icon="caret-right-fill" ani="aniShake" />
												{/if}
											</a>
										</span>
									{/if}
								</Col>
							</Row>
							<Row>
								<Col class="fs-6 kfk-tag fw-bolder">
									{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
									{#if cmt.context?.wfid}
										{$_('comment.fortodo')}
										<a href={`/work/${cmt.context.todoid}`} role="button">
											{cmt.context.biztitle ?? cmt.todoTitle ?? cmt.context.wfid}
										</a>
									{/if}
									<!-- {#if cmt.todoTitle}
										{$_('comment.fortodo')}
										<a href={`/work/${cmt.context.todoid}`} role="button">
											{cmt.todoTitle} ({cmt.todoDoerCN}) aaaa
										</a>
									{/if}
									--->
									{#if cmt.objtype === 'COMMENT'}
										<br />
										<span class="kfk-tag">
											{$_('comment.forcomment')}
											<a
												class="kfk-link px-2"
												href={'#'}
												on:click={(e) => {
													e.preventDefault();
													pointToOrigin = cmt.objid;
												}}>
												{cmt.towhomCN}
											</a>
										</span>
									{/if}
									{#if (!cmt.children || (cmt.children && cmt.children.length === 0)) && cmt.who === user.eid}
										<a
											href={'#'}
											class="kfk-link px-2"
											on:click={async (e) => {
												e.preventDefault();
												let res = await api.post(
													'comment/delete',
													{ commentid: cmt._id },
													user.sessionToken,
												);
												if (res.error) {
													console.log(res.message);
												} else {
													comments.splice(cmtIndex, 1);
													comments = comments;
												}
											}}>
											<AniIcon icon="trash" ani="aniShake" />
										</a>
									{/if}
								</Col>
							</Row>
						</Col>
					{/key}
				</Row>
				<!-- comment header -->
				<Row cols="1">
					<Col>
						<div>
							{@html cmt.mdcontent2}
						</div>
					</Col>
				</Row>
				<Row cols="1">
					<div class="col ps-1 pb-3">
						<span class="kfk-tag ms-0">
							<a
								href={'#'}
								class="kfk-link px-2"
								on:click|preventDefault={(e) => {
									if (replyToCmtId === cmt._id) {
										replyToCmtId = '';
									} else {
										replyToCmtId = cmt._id;
									}
								}}>
								{#if replyToCmtId === cmt._id}
									Reply <AniIcon icon="backspace-fill" ani="aniShake" />
								{:else}
									Reply <AniIcon icon="reply-fill" ani="aniShake" />
								{/if}
							</a>
						</span>
						<span class="kfk-tag">
							<a href={'#'} class="kfk-link px-2" on:click={(e) => thumb(e, cmt, 'up')}>
								{#key thumbnum_changed}
									{#if cmt.upnum > 0}
										<AniIcon icon="hand-thumbs-up-fill" ani="aniShake" />
									{:else}
										<AniIcon icon="hand-thumbs-up" ani="aniShake" />
									{/if}
									{cmt.upnum}
								{/key}
							</a>
						</span>
						<span class="kfk-tag">
							<a
								href={'#'}
								role="button"
								class="kfk-link px-2"
								on:click={(e) => thumb(e, cmt, 'down')}>
								{#if cmt.downnum > 0}
									<AniIcon icon="hand-thumbs-down-fill" ani="aniShake" />
								{:else}
									<AniIcon icon="hand-thumbs-down" ani="aniShake" />
								{/if}
								{#key thumbnum_changed}
									{cmt.downnum}
								{/key}
							</a>
						</span>
					</div>
					{#if replyToCmtId === cmt._id}
						<div class="col m-0 p-0 pb-2 w-100">
							<CommentInput
								bind:value={cmt.reply}
								cmtid={cmt._id}
								placeholder={'Your reply...'}
								on:close={async (e) => (replyToCmtId = '')}
								on:comment={async (e) => {
									e.preventDefault();
									replyToCmtId = '';
									let res = await api.post(
										'comment/add',
										{
											cmtid: cmt._id,
											content: e.detail,
											threadid: cmt.threadid,
										},
										user.sessionToken,
									);
									if (res.error) {
										console.log(res.message);
									} else {
										//cmt.children = res.comments;
										if (cmt.children === undefined) {
											cmt.children = [];
										}
										cmt.transition = false;
										cmt.children.unshift(res.thisComment);
										for (let i = 0; i < cmt.children.length; i++) {
											cmt.children[i].transition = i === 0;
										}
										cmt.children = cmt.children;
										cmt.showChildren = true;
										cmt.reply = '';
									}
								}} />
						</div>
					{/if}
				</Row>
				<!-- Thumb, Reply, ReplyInput -->
				{#if cmt.showChildren && cmt.children.length > 0}
					<div class="comment-child row row-cols-1">
						<div class="col">
							<svelte:self bind:comments={cmt.children} bind:pointToOrigin />
						</div>
					</div>
				{/if}
			</div>
			<!-- the big box-->
		</div>
	</Transition>
{/each}
