import {EventDispatcher, ListenerManager} from "../../src/index";

describe('EventDispatcher', () => {

  it('adds event listeners', () => {

    let dispatcher = new EventDispatcher();
    let listener = () => {};
    
    dispatcher.addEventListener('foo-event', listener);

    let listeners:Set<Function> = (<any>dispatcher).listeners['foo-event'];

    expect(listeners.has(listener)).toBeTruthy();
  });

  it('removes event listeners', () => {

    let dispatcher = new EventDispatcher();
    let listener = () => {};
    let listener2 = () => {};

    dispatcher.addEventListener('foo-event', listener);
    dispatcher.addEventListener('foo-event', listener2);

    let listeners:Set<Function> = (<any>dispatcher).listeners['foo-event'];

    dispatcher.removeEventListener('foo-event', listener);

    expect(listeners.has(listener)).toBeFalsy();
    expect(listeners.has(listener2)).toBeTruthy();
  });

  it('sets the target of the event properly', () => {

    let target = {};
    let dispatcher = new EventDispatcher(target);
    let event;
    let listener = (_event) => {event = _event};

    dispatcher.addEventListener('foo-event', listener);
    dispatcher.dispatchEvent('foo-event');

    expect(target).toEqual(event.target);
  });

  it('dispatches events properly', () => {

    let dispatcher = new EventDispatcher();
    let called = false;
    let event;
    let listener = (_event) => {called = true; event = _event};

    dispatcher.addEventListener('foo-event', listener);
    dispatcher.dispatchEvent('foo-event');

    expect(called).toBeTruthy();
    expect(event.name).toEqual('foo-event');

    called = false;
    event = undefined;

    dispatcher.dispatchEvent({name: 'foo-event', data: 'foo'});
    expect(called).toBeTruthy();
    expect(event.data).toEqual('foo');

  });

  it('breaks dispatch loop when event is cancelled', () => {

    let dispatcher = new EventDispatcher();
    let callCount = 0;
    let listener = () => {callCount++; return false};

    dispatcher.addEventListener('foo-event', listener);

    // Dispatch an event that is cancelled from the start
    dispatcher.dispatchEvent({
      name: 'foo-event',
      cancelable: true,
      canceled: true
    });

    expect(callCount).toEqual(0);

    dispatcher.addEventListener('foo-event', listener.bind(null));
    dispatcher.dispatchEvent({name: 'foo-event', cancelable: true});

    // One of the listeners returned false, breaking the dispatch loop.
    // Therefore, the other listener should not have been called.
    expect(callCount).toEqual(1);
  });
});

describe('ListenerManager', () => {

  it('attaches event listeners', () => {

    let target = new EventDispatcher();
    let listenerManager = new ListenerManager();
    let called = false;
    let listener = () => {called = true};

    listenerManager.attachEventListener(target, 'foo-event', listener);

    target.dispatchEvent('foo-event');

    expect(called).toBeTruthy();
  });

  it('detaches event listeners', () => {

    let target = new EventDispatcher();
    let listenerManager = new ListenerManager();
    let called = false;
    let listener = () => {called = true};

    listenerManager.attachEventListener(target, 'foo-event', listener);
    listenerManager.detachEventListeners(target, 'foo-event');

    target.dispatchEvent('foo-event');

    listenerManager.attachEventListener(target, 'foo-event', listener);
    listenerManager.attachEventListener(target, 'bar-event', listener);
    listenerManager.detachEventListeners(target);

    target.dispatchEvent('foo-event');
    target.dispatchEvent('bar-event');

    let target2 = new EventDispatcher();
    listenerManager.attachEventListener(target2, 'foo-event', listener);
    listenerManager.attachEventListener(target, 'foo-event', listener);
    listenerManager.detachEventListeners();

    target.dispatchEvent('foo-event');
    expect(called).toBeFalsy();

  });

  it('attaches listeners to native EventTarget instances', () => {

    let listenerManager = new ListenerManager();
    let called = false;

    listenerManager.attachEventListener(document, 'click', () => {called = true});

    let event = new Event('click');
    document.dispatchEvent(event);

    expect(called).toBeTruthy();
  });
});
