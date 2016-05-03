declare module 'wg-events' {

  /**
   * Describes the base structure of the events dispatched by an
   * [[IEventDispatcher]]
   */
  export interface IEvent {
    /**
     * The name of the event
     */
    name:string;
    /**
     * Determines if the event is cancelable, so that the event dispatch loop
     * can be interrupted by setting [[IEvent.canceled]] to true or by returning
     * false from an event listener
     */
    cancelable?:boolean;
    /**
     * Determines if the event is canceled
     */
    canceled?:boolean;
    /**
     * The target of the event
     */
    target?:any;
  }
  /**
   * The API that all events dispatcher must provide
   */
  export interface IEventDispatcher {
    /**
     * Adds an event listener for the indicated event
     * @param event The event to listen to
     * @param listener The listener to call when the event is dispatched
     */
    addEventListener(event:string, listener:Function):any;
    /**
     * An alias for [[IEventDispatcher.addEventListener]]
     * @param event
     * @param listener
     */
    on(event:string, listener:Function):any;
    /**
     * Removes the event listener for the indicated event
     * @param event The event for which the listener was added
     * @param listener The listener to remove
     */
    removeEventListener(event:string, listener:Function):any;
    /**
     * An alias for [[IEventDispatcher.removeEventListener]]
     * @param event
     * @param listener
     */
    off(event:string, listener:Function):any;
    /**
     * Dispatches the indicated event, initiating a dispatch loop where each
     * of the listeners added for that event are called. The dispatch loop may
     * be interrupted if the event is cancelable and any of the listeners cancels
     * the event, either by returning false or by setting [[IEvent.canceled]] to
     * true
     * @param event
     */
    dispatchEvent(event:string | IEvent):any;
  }
  /**
   * A helper class to allow more control over the listeners added to an event
   * target (an implementation of [[IEventDispatcher]] or a native implementation
   * of EventTarget)
   */
  export interface IListenerManager {
    /**
     * Attaches an event listener to the specified target (an implementation of
     * [[IEventTarget]]). All the listeners added for the event in this way can
     * be removed by calling [[IListenerManager.detachEventListeners]]
     * @param target
     * @param event
     * @param listener
     */
    attachEventListener?(target:IEventTarget, event:string, listener:Function):any;
    /**
     * Detaches the listeners for the indicated target and the indicated event.
     * If the event is omitted, then all listeners added to the target are
     * removed. If the target is also omitted, the all the listeners attached to
     * any event target with this manager are removed.
     * @param target
     * @param event
     */
    detachEventListeners?(target?:IEventTarget, event?:string):any;
  }
  /**
   * The type for any event target. Either a [[IEventDispatcher]] or a native
   * EventTarget
   */
  export type IEventTarget = IEventDispatcher | EventTarget;
  /**
   * The default implementation of [[IEventDispatcher]]
   */
  export class EventDispatcher implements IEventDispatcher {
    private listeners;
    private target;

    constructor(target?:any);

    /**
     * @inheritdoc
     */
    addEventListener(event:string, listener:Function):void;

    /**
     * @inheritdoc
     */
    on(event:string, listener:Function):void;

    /**
     * @inheritdoc
     */
    removeEventListener(event:string, listener:Function):void;

    /**
     * @inheritdoc
     */
    off(event:string, listener:Function):void;

    /**
     * @inheritdoc
     */
    dispatchEvent(event:string | IEvent):void;

    private injectTarget(event);
  }
  /**
   * The default implementation of [[IListenerManager]]
   */
  export class ListenerManager implements IListenerManager {
    private attachedListeners;

    constructor();

    /**
     * @inheritdoc
     */
    attachEventListener(target:IEventTarget, event:string, listener:Function):void;

    /**
     * @inheritdoc
     */
    detachEventListeners(target?:IEventTarget, event?:string):void;
  }
  export class EventManager implements IEventDispatcher, IListenerManager {
    private dispatcher;
    private listenerManager;

    constructor(target:any);

    addEventListener(event:string, listener:Function):void;

    on(event:string, listener:Function):void;

    removeEventListener(event:string, listener:Function):void;

    off(event:string, listener:Function):void;

    dispatchEvent(event:string | IEvent):void;

    attachEventListener(target:IEventTarget, event:string, listener:Function):void;

    detachEventListeners(target?:IEventTarget, event?:string):void;

    forwardEvents(target:IEventDispatcher, events:string[]):void;
  }

}
