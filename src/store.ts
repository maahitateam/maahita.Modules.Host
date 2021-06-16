import { writable, derived, Writable } from "svelte/store";
import { appRoles } from "./appconfig";
import type { ISession, ISessionRequest, IPresenter } from "./interfaces";
const createWritableStore = (key: string, startValue: Object) => {
    const { subscribe, set } = writable(startValue);
    return {
        subscribe,
        set,
        useLocalStorage: () => {
            const json = localStorage.getItem(key);
            if (json) {
                set(JSON.parse(json));
            }
            subscribe(current =>
                localStorage.setItem(key, JSON.stringify(current))
            );
        }
    };
};
export const sessions: Writable<ISession[]> = writable([]);
export const sessionrequests: Writable<ISessionRequest[]> = writable([]);
export const presenters: Writable<IPresenter[]> = writable([]);
export const presenter_sessions: Writable<ISession[]> = writable([]);
export const current_presenter: Writable<IPresenter> = writable({} as IPresenter);
export const current_session: Writable<ISession> = writable({} as ISession);
export const appuser = createWritableStore('appuser', { isLoggedIn: false });
export const isUserLoggedIn = derived(appuser, $appuser => $appuser['isLoggedIn']);
export const loggedInUserId = derived(appuser, $appuser => $appuser['uid']);
export const isAdmin = derived(appuser, $appuser =>
    $appuser['isLoggedIn'] &&
    $appuser['customClaims']['claim'] === appRoles.admin);
export const isPresenter = derived(appuser, $appuser =>
    $appuser['isLoggedIn'] &&
    $appuser['customClaims']['claim'] === appRoles.presenter);
export const isUser = derived(appuser, $appuser =>
    $appuser['isLoggedIn'] &&
    $appuser['customClaims']['claim'] === appRoles.user);
export const token = derived(appuser, $appuser => $appuser['token']);