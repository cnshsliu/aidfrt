import * as api from '$lib/api';
import type { PageLoad } from './$types';
import { TagStorage } from '$lib/mtcLocalStores';
export const load: PageLoad = async ({ parent }) => {
	const { token } = await parent();
	const allTags = {
		org: [],
		mine: []
	};
	allTags.org = await api.post('tag/org', {}, token);
	allTags.mine = await api.post('tag/list', { objtype: 'template' }, token);
	TagStorage.set(allTags);

	return {
		allTags: allTags
	};
};
