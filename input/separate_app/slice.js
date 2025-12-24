import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import { memoize } from 'proxy-memoize';
import { clusterItems, handleListUpdate } from '../../helpers/lists';
import daugava from '../../api/methods/daugava';
import { getGroupObjectIds, removeObjects } from '../objects/slice';

export const objectGroupsSlice = createSlice({
	name: 'objectGroups',
	initialState: {
		groups: [],
		loaded: false,
		editingActive: false,
		editGroupId: null,
		expanded: [],
		filters: {},
		cadastralImportGroupId: '',
	},
	reducers: {
		startEditing: (state, action) => {
			const id = action.payload;
			state.editingActive = true;
			if (id) {
				state.editGroupId = id;
			}
		},
		stopEditing: (state) => {
			state.editingActive = false;
			state.editGroupId = null;
		},
		updateFilter: (state, action) => {
			const { group, key, value } = action.payload;
			if (value === null) {
				delete state.filters[group][key];
			} else {
				if (group in state.filters) {
					state.filters[group][key] = value;
				} else {
					state.filters[group] = { [key]: value };
				}
			}
		},
		clearAllGroupFilters: (state, action) => {
			const group = action.payload;
			for (const key in state.filters[group]) {
				delete state.filters[group][key];
			}
		},
		expand: (state, action) => {
			const id = action.payload;
			state.expanded.push(id);
		},
		hide: (state, action) => {
			state.expanded = state.expanded.filter((id) => action.payload !== id);
		},

		updateGroup: (state, action) => {
			const { id, data } = action.payload;

			state.groups = state.groups.map((ev) => {
				if (ev.id === id) {
					return {
						...ev,
						...data,
					};
				}

				return ev;
			});
		},
		setGroups: (state, action) => {
			const currentObjects = state.groups;
			const { formattedGroups } = action.payload;
			const updatedObjects = handleListUpdate(currentObjects, formattedGroups, 'id', 'list');
			state.groups = updatedObjects;
			state.expanded = updatedObjects
				.filter((gr) => gr.metadata?.expanded)
				.map((entry) => entry.id)
				.flat();

			state.loaded = true;
		},
		removeGroups: (state, action) => {
			state.groups = state.groups.filter((obj) => !action.payload.includes(obj.id));
			state.expanded = state.expanded.filter((id) => !action.payload.includes(id));
		},
		clearGroups: (state, action) => {
			state.loaded = false;
			state.groups = [];
			state.expanded = [];
		},
		setCadastralImportGroupId: (state, action) => {
			state.cadastralImportGroupId = action.payload;
		},
	},
});

const { actions } = objectGroupsSlice;

const formatGroup = (objGroup) => {
	const attrs = objGroup.attributes;
	const titleProp = attrs.filter((attr) => !!attr?.name_prop === true).map((a) => a.value)[0];
	const searchProps = attrs.filter((attr) => !!attr?.search_prop === true).map((a) => a.value);

	return {
		...objGroup,
		titleProp,
		searchProps,
	};
};

export const setCadastralImportGroupId = (status) => (dispatch) => {
	dispatch(actions.setCadastralImportGroupId(status));
};

export const updateFilter =
	({ group, key, value }) =>
		(dispatch) => {
			dispatch(actions.updateFilter({ group, key, value }));
		};

export const clearAllGroupFilters = (group) => (dispatch) => {
	dispatch(actions.clearAllGroupFilters(group));
};

export const setGroups = (groupData) => async (dispatch, getState) => {
	dispatch(removeObjects());
	dispatch(actions.clearGroups());
	const formattedGroups = groupData ? groupData.map(formatGroup) : [];

	dispatch(actions.setGroups({ formattedGroups }));
};

export const updateGroup = (id, groupdata) => (dispatch, getState) => {
	if (!id) {
		return;
	}

	const formattedGroups = [
		{
			id,
			...groupdata.data,
		},
	].map(formatGroup);

	dispatch(
		actions.setGroups({
			formattedGroups,
		}),
	);
};

export const toggleEditing =
	(id = null) =>
		(dispatch, getState) => {
			const isActive = getState().objectGroups.editingActive;
			if (isActive) {
				dispatch(actions.stopEditing());
			} else {
				dispatch(actions.startEditing(id));
			}
		};

export const handleGroupDeletion = (id, deleteAlsoGroup) => (dispatch, getState) => {
	const groupObjects = getGroupObjectIds(getState(), id);
	dispatch(removeObjects(groupObjects));
	if (deleteAlsoGroup) {
		dispatch(actions.removeGroups([id]));
	}
	daugava.objectGroups.delete(deleteAlsoGroup, id);
};

export const toggleExpand = (id) => (dispatch, getState) => {
	const currentlyExpanded = getState().objectGroups.expanded;
	if (currentlyExpanded.includes(id)) {
		dispatch(actions.hide(id));
	} else {
		dispatch(actions.expand(id));
	}
};

export const getDefaultGroup = (state, object = null) => {
	const groupIdToSearch = object?.meta?.group;
	if (groupIdToSearch) {
		const findGroup = state.objectGroups.groups.find((gr) => gr.id === groupIdToSearch);
		if (findGroup?.id) {
			return findGroup;
		}
	}
	return state.objectGroups.groups[0];
};

export const getGroupsById = (state, ids) => {
	const { expanded } = state.objectGroups;
	return state.objectGroups.groups
		.filter((obj) => ids.includes(obj.id))
		.map((obj) => {
			return {
				...obj,
				expanded: expanded.includes(obj.id),
			};
		});
};

export const getGroupById = (state, id) => {
	if (!id) {
		return {};
	}
	return getGroupsById(state, [id])[0];
};

const groupSort = (x, y) => {
	return x.is_archived - y.is_archived || x.id - y.id;
};

export const groupsForSelect = (state, isNewObject) => {
	return state.objectGroups.groups.filter((gr) => groupCan.editable(gr, isNewObject)).map((gr) => ({ value: gr.id, label: gr.name }));
};

export const groupCan = {
	editable: (group, isNewObject = false) => {
		if (group.is_archived) {
			return false;
		}

		if (group.metadata?.add_new_objects === false && isNewObject) {
			return false;
		}

		return true;
	},
	geometryEditable: (group) => {
		return group?.metadata?.geometry_edit ?? true;
	},
	objectsAreSplittable: (group) => {
		return 'geometry_edit' in group.metadata ? !group.metadata?.geometry_edit : false;
	},
};

export const makeFilterables = (objectGroups) => {
	const toRet = {};

	for (const gr of objectGroups) {
		const { id: groupId, attributes, attribute_translations: translations } = gr;

		for (const attr of attributes) {
			const { value, data_type: type, filterable, select_options: options } = attr;
			const isSelect = type && type === 'select';
			const isFilterable = !!filterable;
			if (isFilterable && isSelect) {
				if (groupId in toRet) {
					toRet[groupId][value] = { title: translations[value], options };
				} else {
					toRet[groupId] = { [value]: { title: translations[value], options } };
				}
			}
		}
	}

	return toRet;
};

export const selectors = {
	// groupsForSelect: memoize((state, isNewObject) => state.objectGroups.groups.filter(gr => isEditableGroup(gr, isNewObject)).map(gr => ({ value: gr.id, label: gr.name }))),
	filters: (state) => state.objectGroups.filters,
	filterables: (state) => makeFilterables(state.objectGroups.groups),
	groupIds: memoize((state) =>
		[...state.objectGroups.groups]
			.sort(groupSort)
			.map((gr) => gr.id)
			.flat(),
	),
	editingActive: (state) => state.objectGroups.editingActive,
	groupMapping: (state) => state.objectGroups.groups.reduce((a, v) => ({ ...a, [v.id]: v }), {}),
	groupIdsVisibleMap: memoize((state) =>
		state.objectGroups.groups
			.filter((gr) => gr.metadata?.visible_on_map)
			.map((gr) => gr.id.toString())
			.flat(),
	),
	loaded: (state) => state.objectGroups.loaded,
	editGroupId: (state) => state.objectGroups.editGroupId,
	cadastralImportGroupId: (state) => state.objectGroups.cadastralImportGroupId,
};

export { actions };

export default objectGroupsSlice.reducer;
