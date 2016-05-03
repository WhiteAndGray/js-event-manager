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
  addEventListener(event:string, listener:Function);
  
  /**
   * An alias for [[IEventDispatcher.addEventListener]]
   * @param event
   * @param listener
   */
  on(event:string, listener:Function);
  
  /**
   * Removes the event listener for the indicated event
   * @param event The event for which the listener was added
   * @param listener The listener to remove
   */
  removeEventListener(event:string, listener:Function);
  
  /**
   * An alias for [[IEventDispatcher.removeEventListener]]
   * @param event
   * @param listener
   */
  off(event:string, listener:Function);
  
  /**
   * Dispatches the indicated event, initiating a dispatch loop where each
   * of the listeners added for that event are called. The dispatch loop may
   * be interrupted if the event is cancelable and any of the listeners cancels
   * the event, either by returning false or by setting [[IEvent.canceled]] to 
   * true
   * @param event
   */
  dispatchEvent(event:string|IEvent);

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
  attachEventListener?(target:IEventTarget, event:string, listener:Function);
  
  /**
   * Detaches the listeners for the indicated target and the indicated event.
   * If the event is omitted, then all listeners added to the target are 
   * removed. If the target is also omitted, the all the listeners attached to
   * any event target with this manager are removed.
   * @param target
   * @param event
   */
  detachEventListeners?(target?:IEventTarget, event?:string);

}

/**
 * The type for any event target. Either a [[IEventDispatcher]] or a native
 * EventTarget
 */
export type IEventTarget = IEventDispatcher|EventTarget;

/**
 * The default implementation of [[IEventDispatcher]]
 */
export class EventDispatcher implements IEventDispatcher {

  private listeners:{[eventName:string]: Set<Function>} = {};

  private target:any;

  constructor(target?:any) {
    this.target = target;
  }
  
  /**
   * @inheritdoc
   */
  addEventListener(event:string, listener:Function) {
    let listenersForEvent = this.listeners[event];
    if (!listenersForEvent) {
      this.listeners[event] = listenersForEvent = new Set<Function>();
    }
    listenersForEvent.add(listener);
  }
  
  /**
   * @inheritdoc
   */
  on(event:string, listener:Function) {
    this.addEventListener(event, listener);
  }
  
  /**
   * @inheritdoc
   */
  removeEventListener(event:string, listener:Function) {
    let listenersForEvent = this.listeners[event];
    if (listenersForEvent) {
      listenersForEvent.delete(listener);
      if ((<any>listenersForEvent).size === 0) {
        delete this.listeners[event];
      }
    }
  }
  
  /**
   * @inheritdoc
   */
  off(event:string, listener:Function) {
    this.removeEventListener(event, listener);
  }
  
  /**
   * @inheritdoc
   */
  dispatchEvent(event:string|IEvent) {
    let _event:IEvent;
    if (typeof event === 'string') {
      _event = {name: <string>event};
    } else {
      _event = Object.assign({}, event);
    }

    let listenersForEvent:Set<Function> = this.listeners[_event.name];
    if (!listenersForEvent) {
      return;
    }
    this.injectTarget(_event);

    let cancelable = _event.cancelable;
    let iterator = listenersForEvent.values();
    let current = iterator.next();
    let lastResult = undefined;
    while (!current.done) {
      if (cancelable && (lastResult === false || _event.canceled)) {
        break;
      }
      lastResult = (<Function>current.value)(_event);
      current = iterator.next();
    }
  }

  private injectTarget(event:IEvent) {
    Object.defineProperty(event, 'target', <PropertyDescriptor>{
      enumerable: true,
      configurable: false,
      writable: false,
      value: this.target || this
    });
  }
}

/**
 * The default implementation of [[IListenerManager]]
 */
export class ListenerManager implements IListenerManager {

  private attachedListeners:Map<any, {[eventName:string]: Set<Function>}>;

  constructor() {
    this.attachedListeners = new Map<any, {[eventName:string]: Set<Function>}>();
  }
  
  /**
   * @inheritdoc
   */
  attachEventListener(target:IEventTarget, event:string, listener:Function) {
    let listenersForTarget = this.attachedListeners.get(target);
    if (!listenersForTarget) {
      this.attachedListeners.set(target, listenersForTarget = {});
    }

    let listenerForEvent = listenersForTarget[event];
    if (!listenerForEvent) {
      listenersForTarget[event] = listenerForEvent = new Set<Function>();
    }

    (<IEventDispatcher>target).addEventListener(event, listener);
    listenerForEvent.add(listener);
  }
  
  /**
   * @inheritdoc
   */
  detachEventListeners(target?:IEventTarget, event?:string) {
    let targets:IEventTarget[][] = target ? [[target]] : Array.from(this.attachedListeners);
    targets.forEach(entry => {
      let target = entry[0];
      let listenerForTarget = this.attachedListeners.get(target);
      if (!listenerForTarget) {
        return;
      }
      let events = event ? [event] 
        : Object.getOwnPropertyNames(listenerForTarget);
      
      events.forEach(event => {
        let listenersForEvent = listenerForTarget[event];
        if (!listenersForEvent) {
          return;
        }
        
        listenersForEvent.forEach(listener => {
          (<IEventDispatcher>target).removeEventListener(event, listener);
        });
        delete listenerForTarget[event];
      });
      
      if (Object.getOwnPropertyNames(listenerForTarget).length === 0) {
        this.attachedListeners.delete(target);
      }
    });
  }

}

export class EventManager implements IEventDispatcher, IListenerManager {

  private dispatcher:EventDispatcher;

  private listenerManager = new ListenerManager();

  constructor(target:any) {
    this.dispatcher = new EventDispatcher(target);
    this.listenerManager = new ListenerManager();
  }

  addEventListener(event:string, listener:Function) {
    this.dispatcher.addEventListener(event, listener);
  }

  on(event:string, listener:Function) {
    this.dispatcher.on(event, listener);
  }

  removeEventListener(event:string, listener:Function) {
    this.dispatcher.removeEventListener(event, listener);
  }

  off(event:string, listener:Function) {
    this.dispatcher.off(event, listener);
  }

  dispatchEvent(event:string|IEvent) {
    this.dispatcher.dispatchEvent(event);
  }

  attachEventListener(target:IEventTarget, event:string, listener:Function) {
    this.listenerManager.attachEventListener(target, event, listener);
  }

  detachEventListeners(target?:IEventTarget, event?:string) {
    this.listenerManager.detachEventListeners(target, event);
  }

}
