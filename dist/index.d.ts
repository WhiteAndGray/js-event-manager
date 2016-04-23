export interface IEvent {
    name: string;
    cancelable?: boolean;
    canceled?: boolean;
    target?: any;
}
export interface IEventDispatcher {
    addEventListener(event: string, listener: Function): any;
    on(event: string, listener: Function): any;
    removeEventListener(event: string, listener: Function): any;
    off(event: string, listener: Function): any;
    dispatchEvent(event: string | IEvent): any;
}
export interface IListenerManager {
    attachEventListener(target: IEventTarget, event: string, listener: Function): any;
    detachEventListeners(target?: IEventTarget, event?: string): any;
}
export declare type IEventTarget = IEventDispatcher | EventTarget;
export declare class EventDispatcher implements IEventDispatcher {
    private listeners;
    private target;
    constructor(target?: any);
    addEventListener(event: string, listener: Function): void;
    on(event: string, listener: Function): void;
    removeEventListener(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    dispatchEvent(event: string | IEvent): void;
    private injectTarget(event);
}
export declare class ListenerManager implements IListenerManager {
    private attachedListeners;
    constructor();
    attachEventListener(target: IEventTarget, event: string, listener: Function): void;
    detachEventListeners(target?: IEventTarget, event?: string): void;
}
