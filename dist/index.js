define(["require", "exports"], function (require, exports) {
    "use strict";
    var EventDispatcher = (function () {
        function EventDispatcher(target) {
            this.listeners = {};
            this.target = target;
        }
        EventDispatcher.prototype.addEventListener = function (event, listener) {
            var listenersForEvent = this.listeners[event];
            if (!listenersForEvent) {
                this.listeners[event] = listenersForEvent = new Set();
            }
            listenersForEvent.add(listener);
        };
        EventDispatcher.prototype.on = function (event, listener) {
            this.addEventListener(event, listener);
        };
        EventDispatcher.prototype.removeEventListener = function (event, listener) {
            var listenersForEvent = this.listeners[event];
            if (listenersForEvent) {
                listenersForEvent.delete(listener);
                if (listenersForEvent.size === 0) {
                    delete this.listeners[event];
                }
            }
        };
        EventDispatcher.prototype.off = function (event, listener) {
            this.removeEventListener(event, listener);
        };
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
    var ListenerManager = (function () {
        function ListenerManager() {
            this.attachedListeners = new Map();
        }
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
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFnSEE7UUFNRSx5QkFBWSxNQUFXO1lBSmYsY0FBUyxHQUF1QyxFQUFFLENBQUM7WUFLekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkIsQ0FBQztRQUtELDBDQUFnQixHQUFoQixVQUFpQixLQUFZLEVBQUUsUUFBaUI7WUFDOUMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFZLENBQUM7WUFDbEUsQ0FBQztZQUNELGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBS0QsNEJBQUUsR0FBRixVQUFHLEtBQVksRUFBRSxRQUFpQjtZQUNoQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFLRCw2Q0FBbUIsR0FBbkIsVUFBb0IsS0FBWSxFQUFFLFFBQWlCO1lBQ2pELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkMsRUFBRSxDQUFDLENBQU8saUJBQWtCLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNILENBQUM7UUFD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
