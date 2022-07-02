import React, { useState, useEffect, useRef, useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	View,
	ScreenSpinner,
	AdaptivityProvider,
	AppRoot,
	ConfigProvider,
	SplitCol,
	SplitLayout,
	usePlatform,
	VKCOM,
	useAdaptivity,
	Panel,
	PanelHeader,
	Platform,
	ViewWidth,
	SimpleCell,
	Epic,
	Group,
} from '@vkontakte/vkui';
import {
	Icon28HomeOutline,
} from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';
import './styles/style.css'
import Home from './panels/Home';
import { errorAlertCreator, getKeyByValue } from './functions/tools';
import { accountActions, viewsActions } from './store/main';
import { useDispatch, useSelector } from 'react-redux';
import { calculateAdaptivity } from './functions/calcAdaptivity';
import { CANVAS_WIDTH } from './config';
const scheme_params = {

	bright_light: { "status_bar_style": "dark", "action_bar_color": "#FFFFFF", 'navigation_bar_color': "#FFFFFF" },
	space_gray: { "status_bar_style": "light", "action_bar_color": "#19191A", 'navigation_bar_color': "#19191A" }
  }

const platformname = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
var backTimeout = false;
const App = () => {
	const dispatch = useDispatch();
	const { user: userInfo, schemeSettings: { scheme } } = useSelector((state) => state.account)
	const { activeStory, historyPanels, snackbar, activePanel, need_epic } = useSelector((state) => state.views)
	const setHistoryPanels = useCallback((history) => dispatch(viewsActions.setHistory(history)), [dispatch]);
	const setActiveScene = useCallback((story, panel) => dispatch(viewsActions.setActiveScene(story, panel)), [dispatch]);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [vkInfoUser, setVkInfoUser] = useState(null);

	const platformvkui = usePlatform();
	const platform = useRef();
	const viewWidthVk = useAdaptivity().viewWidth;
	const isDesktop = useRef();
	const hasHeader = useRef()

	const setHash = (hash) => {
		if (window.location.hash !== '') {
			bridge.send("VKWebAppSetLocation", { "location": hash });
			window.location.hash = hash
		}
	}
	const goPanel = useCallback((view, panel, forcePanel = false, replaceState = false) => {

		const checkVisitedView = (view) => {
			let history = [...historyPanels];
			history.reverse();
			let index = history.findIndex(item => item.view === view)
			if (index !== -1) {
				return history.length - index
			} else {
				return null;
			}
		}
		const historyChange = (history, view, panel, replaceState) => {
			if (replaceState) {
				history.pop();
				history.push({ view, panel });
				window.history.replaceState({ view, panel }, panel);
			} else {
				history.push({ view, panel });
				window.history.pushState({ view, panel }, panel);
			}
			return history;
		}
		let history = [...historyPanels];
		if (forcePanel) {
			history = historyChange(history, view, panel, replaceState)
		} else {
			let index = checkVisitedView(view);
			if (index !== null) {
				let new_history = history.slice(0, index);
				history = new_history
				window.history.pushState({ view, panel }, panel);
				({ view, panel } = history[history.length - 1])
			} else {
				history = historyChange(history, view, panel, replaceState)
			}
		}
		setHistoryPanels(history);
		setActiveScene(view, panel)
		bridge.send('VKWebAppEnableSwipeBack');
	}, [setActiveScene, historyPanels, setHistoryPanels])
	const goDisconnect = () => {
		goPanel('disconnect', 'disconnect');
	}
	const showErrorAlert = (error = null, action = null) => {
		errorAlertCreator(setPopout, error, action)
	}
	const Init = useCallback(() => {
		const brigeSchemeChange = (params) => {
			bridge.send("VKWebAppSetViewSettings", params);
		}
		bridge.subscribe(({ detail: { type, data } }) => {
			if (type === 'VKWebAppUpdateConfig') {
				let new_scheme = data.scheme ? data.scheme : 'client_light';
				dispatch(accountActions.setScheme({ scheme: new_scheme }))
				if (platformname) {
					switch (new_scheme) {
						case 'bright_light':
							brigeSchemeChange(scheme_params.bright_light)
							break;
						case 'space_gray':
							brigeSchemeChange(scheme_params.space_gray)
							break;
						default:
							brigeSchemeChange(scheme_params.bright_light)
					}
				}

			}
		});

		bridge.send("VKWebAppInit");
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setVkInfoUser(user);
			setPopout(null)
			goPanel('main', 'home', true, true)
		}
		fetchData();
		// eslint-disable-next-line
	}, [])
	useEffect(() => {
		Init()
	}, [Init]);
	const goBack = useCallback(() => {
		let history = [...historyPanels]
		if (!backTimeout) {
			backTimeout = true;
			if (history.length <= 1) {
				bridge.send("VKWebAppClose", { "status": "success" });
			} else {
				if (history[history.length] >= 2) {
					bridge.send('VKWebAppDisableSwipeBack');
				}
				setHash('');
				history.pop()
				let { view, panel } = history[history.length - 1];
				setActiveScene(view, panel)
				setPopout(<ScreenSpinner />)
				setTimeout(() => {
					setPopout(null)
				}, 500)
			}
			setHistoryPanels(history)
			setTimeout(() => { backTimeout = false; }, 500)

		} else {
			window.history.pushState({ ...history[history.length - 1] }, history[history.length - 1].panel);
		}
	}, [historyPanels, setHistoryPanels, setActiveScene])
	const handlePopstate = useCallback((e) => {
		e.preventDefault();
		goBack();
	}, [goBack]);
	useEffect(() => {
		if (platformname) {
			platform.current = platformvkui;
		} else {
			platform.current = Platform.VKCOM;
		}
	}, [platformvkui])

	useEffect(() => {
		window.addEventListener('popstate', handlePopstate);
		return () => {
			window.removeEventListener('popstate', handlePopstate)
		}
	}, [handlePopstate])



	useEffect(() => {
		if (platformname) {
			platform.current = platformvkui;
		} else {
			platform.current = Platform.VKCOM;
		}
	}, [platformvkui])


	useEffect(() => {
		hasHeader.current = platform.current !== VKCOM;
		isDesktop.current = viewWidthVk >= ViewWidth.SMALL_TABLET;
	}, [viewWidthVk, platform])


	return (
		<ConfigProvider platform={platform.current} scheme={scheme}>
			<AppRoot>
				<SplitLayout
					style={{ justifyContent: "center" }}
					popout={popout}>

					<SplitCol
						animate={!isDesktop.current}
						spaced={isDesktop.current}
						width={isDesktop.current ? CANVAS_WIDTH+'px' : '100%'}
						maxWidth={isDesktop.current ? CANVAS_WIDTH+'px' : '100%'}>
						<Epic activeStory={activeStory}>
							<View activePanel={activePanel}
							id='main'>
								<Home id='home' />
							</View>
						</Epic>
					</SplitCol>
					{isDesktop.current &&
						<SplitCol fixed width="280px" maxWidth="280px">
							<Panel id='menu_epic'>
								{hasHeader.current && <PanelHeader />}
								<Group>
									<SimpleCell
									disabled={activeStory === 'home'}
									style={activeStory === 'home' ? {
										backgroundColor: "var(--button_secondary_background)",
										borderRadius: 8,
										color: '#626D7A'} : {color: '#626D7A'}}
									onClick={() => goPanel('home', 'home')}
									before={<Icon28HomeOutline style={{color: '#99A2AD'}} />}>
										Главная
									</SimpleCell>
								</Group>
								
							</Panel>
						</SplitCol>}
				</SplitLayout>
			</AppRoot>
		</ConfigProvider>
	);
}

export default () => (
	<AdaptivityProvider viewWidth={calculateAdaptivity(document.documentElement.clientWidth, document.documentElement.clientHeight).viewWidth}>
		<App />
	</AdaptivityProvider>
);

