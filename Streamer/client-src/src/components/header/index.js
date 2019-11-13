import { Component } from 'preact';
import { route } from 'preact-router';

import TopAppBar from 'preact-material-components/TopAppBar';
import Drawer from 'preact-material-components/Drawer';
import List from 'preact-material-components/List';
import Dialog from 'preact-material-components/Dialog';
import Switch from 'preact-material-components/Switch';
import 'preact-material-components/Switch/style.css';
import 'preact-material-components/Dialog/style.css';
import 'preact-material-components/Drawer/style.css';
import 'preact-material-components/List/style.css';
import 'preact-material-components/TopAppBar/style.css';
import style from './style';

import SpaceMeter from '../spaceMeter';

const smolThing = require('../../img/smol.png');

const DARKMODE_KEY = 'darkMode';
export default class Header extends Component {
	closeDrawer() {
		this.drawer.MDComponent.open = false;
		this.state = {
			darkThemeEnabled: false
		};
	}

	openDrawer = () => (this.drawer.MDComponent.open = true);

	openSettings = () => this.dialog.MDComponent.show();

	drawerRef = drawer => (this.drawer = drawer);
	dialogRef = dialog => (this.dialog = dialog);

	linkTo = path => () => {
		route(path);
		this.closeDrawer();
	};

	goHome = this.linkTo('/');
	goToMyProfile = this.linkTo('/profile');
	goToUpload = this.linkTo('/upload');

	toggleDarkTheme = () => {
		this.setState(
			{
				darkThemeEnabled: !this.state.darkThemeEnabled
			},
			this.handleDarkTheme
		);
	}

	handleDarkTheme = () => {
		if (this.state.darkThemeEnabled) {
			document.body.classList.add('mdc-theme--dark');
		} else {
			document.body.classList.remove('mdc-theme--dark');
		}
		localStorage.setItem(DARKMODE_KEY, this.state.darkThemeEnabled);
	};

	componentDidMount () {
		const lDMode = localStorage.getItem(DARKMODE_KEY);
		if (!!lDMode) {
			this.setState({ darkThemeEnabled: lDMode === 'true' }, this.handleDarkTheme);
		}
	}

	render(props) {
		return (
			<div>
				<TopAppBar className="topappbar">
					<TopAppBar.Row>
						<TopAppBar.Section align-start>
							<TopAppBar.Icon menu onClick={this.openDrawer}>
								menu
							</TopAppBar.Icon>
							<TopAppBar.Title style={{ cursor: 'pointer' }} onClick={this.goHome}><img class={style.smolIcon} src={smolThing} />Agua+</TopAppBar.Title>
						</TopAppBar.Section>
						<TopAppBar.Section align-end shrink-to-fit>
							<SpaceMeter />
							<TopAppBar.Icon onClick={this.openSettings}>settings</TopAppBar.Icon>
						</TopAppBar.Section>
					</TopAppBar.Row>
				</TopAppBar>
				<Drawer modal ref={this.drawerRef}>
					<Drawer.DrawerContent>
						<Drawer.DrawerItem selected={props.selectedRoute === '/'} onClick={this.goHome}>
							<List.ItemGraphic>home</List.ItemGraphic>
							Home
						</Drawer.DrawerItem>
						<Drawer.DrawerItem selected={props.selectedRoute === '/upload'} onClick={this.goToUpload}>
							<List.ItemGraphic>cloud_upload</List.ItemGraphic>
							Upload
						</Drawer.DrawerItem>
						<Drawer.DrawerItem selected={props.selectedRoute === '/profile'} onClick={this.goToMyProfile}>
							<List.ItemGraphic>account_circle</List.ItemGraphic>
							Profile
						</Drawer.DrawerItem>
					</Drawer.DrawerContent>
				</Drawer>
				<Dialog ref={this.dialogRef}>
					<Dialog.Header>Settings</Dialog.Header>
					<Dialog.Body>
						<div>
							Enable dark theme <Switch checked={this.state.darkThemeEnabled} onClick={this.toggleDarkTheme} />
						</div>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.FooterButton accept>OK</Dialog.FooterButton>
					</Dialog.Footer>
				</Dialog>
			</div>
		);
	}
}
