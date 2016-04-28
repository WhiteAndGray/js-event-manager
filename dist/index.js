define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * The default implementation of [[IEventDispatcher]]
     */
    var EventDispatcher = (function () {
        function EventDispatcher(target) {
            this.listeners = {};
            this.target = target;
        }
        /**
         * @inheritdoc
         */
        EventDispatcher.prototype.addEventListener = function (event, listener) {
            var listenersForEvent = this.listeners[event];
            if (!listenersForEvent) {
                this.listeners[event] = listenersForEvent = new Set();
            }
            listenersForEvent.add(listener);
        };
        /**
         * @inheritdoc
         */
        EventDispatcher.prototype.on = function (event, listener) {
            this.addEventListener(event, listener);
        };
        /**
         * @inheritdoc
         */
        EventDispatcher.prototype.removeEventListener = function (event, listener) {
            var listenersForEvent = this.listeners[event];
            if (listenersForEvent) {
                listenersForEvent.delete(listener);
                if (listenersForEvent.size === 0) {
                    delete this.listeners[event];
                }
            }
        };
        /**
         * @inheritdoc
         */
        EventDispatcher.prototype.off = function (event, listener) {
            this.removeEventListener(event, listener);
        };
        /**
         * @inheritdoc
         */
        EventDispatcher.prototype.dispatchEvent = function (event) {
            var _event;
            if (typeof event === 'string') {
                _event = { name: event };
            }
            else {
                _event = Object.assign({}, event);
            }
            var listenersForEvent = this.listeners[_event.name];
            if (!listenersForEvent) {
                return;
            }
            this.injectTarget(_event);
            var cancelable = _event.cancelable;
            var iterator = listenersForEvent.values();
            var current = iterator.next();
            var lastResult = undefined;
            while (!current.done) {
                if (cancelable && (lastResult === false || _event.canceled)) {
                    break;
                }
                lastResult = current.value(_event);
                current = iterator.next();
            }
        };
        EventDispatcher.prototype.injectTarget = function (event) {
            Object.defineProperty(event, 'target', {
                enumerable: true,
                configurable: false,
                writable: false,
                value: this.target || this
            });
        };
        return EventDispatcher;
    }());
    exports.EventDispatcher = EventDispatcher;
    /**
     * The default implementation of [[IListenerManager]]
     */
    var ListenerManager = (function () {
        function ListenerManager() {
            this.attachedListeners = new Map();
        }
        /**
         * @inheritdoc
         */
        ListenerManager.prototype.attachEventListener = function (target, event, listener) {
            var listenersForTarget = this.attachedListeners.get(target);
            if (!listenersForTarget) {
                this.attachedListeners.set(target, listenersForTarget = {});
            }
            var listenerForEvent = listenersForTarget[event];
            if (!listenerForEvent) {
                listenersForTarget[event] = listenerForEvent = new Set();
            }
            target.addEventListener(event, listener);
            listenerForEvent.add(listener);
        };
        /**
         * @inheritdoc
         */
        ListenerManager.prototype.detachEventListeners = function (target, event) {
            var _this = this;
            var targets = target ? [[target]] : Array.from(this.attachedListeners);
            targets.forEach(function (entry) {
                var target = entry[0];
                var listenerForTarget = _this.attachedListeners.get(target);
                if (!listenerForTarget) {
                    return;
                }
                var events = event ? [event]
                    : Object.getOwnPropertyNames(listenerForTarget);
                events.forEach(function (event) {
                    var listenersForEvent = listenerForTarget[event];
                    if (!listenersForEvent) {
                        return;
                    }
                    listenersForEvent.forEach(function (listener) {
                        target.removeEventListener(event, listener);
                    });
                    delete listenerForTarget[event];
                });
                if (Object.getOwnPropertyNames(listenerForTarget).length === 0) {
                    _this.attachedListeners.delete(target);
                }
            });
        };
        return ListenerManager;
    }());
    exports.ListenerManager = ListenerManager;
    var EventManager = (function () {
        function EventManager(target) {
            this.listenerManager = new ListenerManager();
            this.dispatcher = new EventDispatcher(target);
            this.listenerManager = new ListenerManager();
        }
        EventManager.prototype.addEventListener = function (event, listener) {
            this.dispatcher.addEventListener(event, listener);
        };
        EventManager.prototype.on = function (event, listener) {
            this.dispatcher.on(event, listener);
        };
        EventManager.prototype.removeEventListener = function (event, listener) {
            this.dispatcher.removeEventListener(event, listener);
        };
        EventManager.prototype.off = function (event, listener) {
            this.dispatcher.off(event, listener);
        };
        EventManager.prototype.dispatchEvent = function (event) {
            this.dispatcher.dispatchEvent(event);
        };
        EventManager.prototype.attachEventListener = function (target, event, listener) {
            this.listenerManager.attachEventListener(target, event, listener);
        };
        EventManager.prototype.detachEventListeners = function (target, event) {
            this.listenerManager.detachEventListeners(target, event);
        };
        return EventManager;
    }());
    exports.EventManager = EventManager;
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUE2R0E7O09BRUc7SUFDSDtRQU1FLHlCQUFZLE1BQVc7WUFKZixjQUFTLEdBQXVDLEVBQUUsQ0FBQztZQUt6RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBRUQ7O1dBRUc7UUFDSCwwQ0FBZ0IsR0FBaEIsVUFBaUIsS0FBWSxFQUFFLFFBQWlCO1lBQzlDLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBWSxDQUFDO1lBQ2xFLENBQUM7WUFDRCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsNEJBQUUsR0FBRixVQUFHLEtBQVksRUFBRSxRQUFpQjtZQUNoQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRDs7V0FFRztRQUNILDZDQUFtQixHQUFuQixVQUFvQixLQUFZLEVBQUUsUUFBaUI7WUFDakQsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDdEIsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuQyxFQUFFLENBQUMsQ0FBTyxpQkFBa0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsT0FBTyxJQUFJLENBQUMsU0FBUyxD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
