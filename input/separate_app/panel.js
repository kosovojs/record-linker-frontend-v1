import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Checkbox, IconButton, Tooltip } from '@mui/material';
import { handleObjectDeletion, initializeObjectEditing, selectors, setVisibleMap, toggleVisible } from '../../features/objects/slice';
import { selectors as appSelectors } from '../../features/app/slice';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: 0,
	},
	coordsSection: {
		paddingLeft: 15,
	},
	editText: {
		fontWeight: 'bold',
	},
	text: {
		width: '283px',
		fontSize: '90%',
		color: theme.palette.gray.main,
	},
	icon: {
		height: 20,
		width: 30,
		margin: '7px 2px 2px 2px',
	},
	sectionFields: {
		display: 'flex',
		flexDirection: 'column',
		minHeight: '40px',
	},
	reportHeader: {
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		borderBottom: '2px dashed #cfcfcf',
	},
	titleHolder: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
	},
	activeReport: {
		backgroundColor: theme.palette.selected.main,
		'&.child + *': {
			borderBottom: '2px inset ' + theme.palette.gray.main,
			marginBottom: '2px',
		},
	},
	addressBlock: {
		display: 'flex',
		alignItems: 'flex-start',
		marginLeft: '40px',
		fontSize: '16px',
		marginBottom: '5px',
	},
	editAddress: {
		padding: 0,
		minWidth: '32px',
	},
	avdbBlock: {
		backgroundColor: theme.palette.gray.main,
		marginLeft: '10px',
		lineHeight: '16px',
	},
	gpsIcon: {
		width: '18px',
		height: '18px',
		marginRight: '6px',
		fill: theme.palette.icon.main,
	},
	timeBlock: {
		display: 'flex',
		padding: '10px 0 10px 20px',
		alignItems: 'baseline',
	},
	timeSpan: {
		color: theme.palette.text.main,
		marginRight: '6px',
		fontSize: '21px',
	},
	sinceSpan: {
		color: theme.palette.text.main,
		fontSize: '16px',
	},
	reportTitle: {
		color: theme.palette.blue.main,
		marginLeft: '8px',
	},
	bold: {
		fontWeight: 'bold',
	},
	filterContainer: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	formControl: {
		marginTop: '10px',
		width: '100%',
	},
	subSectionTitle: {
		padding: '10px',
		margin: 0,
		backgroundColor: '#eadada',
	},
	subSection: {
		backgroundColor: theme.palette.gray.main,
	},
	termInput: {
		backgroundColor: 'white',
		marginBottom: '10px',
		height: '30px',
		border: '1px solid ' + theme.palette.border.main,
	},
	checkbox: {
		padding: '3px',
	},
}));

export const MapObject = ({ child, object }) => {
	const { t } = useTranslation();
	const classes = useStyles();

	const dispatch = useDispatch();
	const currentEditObject = useSelector(selectors.editObjectId);
	const userRole = useSelector(appSelectors.userRole);

	const isEditing = currentEditObject === object.id;

	const showHandler = (id) => {
		dispatch(toggleVisible(id, 'list'));
	};

	const showOnMapHandler = (id) => {
		dispatch(toggleVisible(id, 'map'));
	};

	const editObject = () => {
		dispatch(setVisibleMap(object.id));
		dispatch(initializeObjectEditing([object.id]));
	};

	const deleteObject = () => {
		if (window.confirm(t('map_object.panel.confirm_delete', 'Vai tiešām dzēst objektu?'))) {
			dispatch(handleObjectDeletion([object.id]));
		}
	};

	return (
		<>
			<div
				className={clsx(
					classes.reportHeader,
					/* object.visible && classes.activeReport */
					{ child: child },
				)}>
				<Checkbox className={classes.checkbox} size='small' checked={object.visibleMap} onChange={() => showOnMapHandler(object.id)} inputProps={{ 'aria-label': 'primary checkbox' }} />
				<div className={classes.titleHolder} onClick={() => showHandler(object.id)}>
					<div className={clsx(classes.reportTitle, isEditing && classes.bold)}>{object.title}</div>
				</div>
				{userRole !== 'viewer' && (
					<>
						<Tooltip placement='right-start' title={t('map_object.panel.change_object_info', 'Labot objekta informāciju')}>
							<IconButton aria-label='edit' size='small' onClick={editObject}>
								<EditIcon fontSize='inherit' />
							</IconButton>
						</Tooltip>
						<Tooltip placement='right-start' title={t('map_object.panel.delete_object', 'Dzēst objektu')}>
							<IconButton aria-label='delete' size='small' onClick={deleteObject}>
								<DeleteForeverIcon fontSize='inherit' />
							</IconButton>
						</Tooltip>
					</>
				)}
			</div>
		</>
	);
};
