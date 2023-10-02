// https://gist.github.com/Checksum/27867c20fa371014cf2a93eafb7e0204
const WebSocketProxy = new Proxy(window.WebSocket, {
    construct(target, args) {
        console.log("Proxying WebSocket connection", ...args);
        const ws = new target(...args);
        // Configurable hooks
        ws.hooks = {
            beforeSend: () => null,
            beforeReceive: () => null,
        };
        // Intercept send
        const sendProxy = new Proxy(ws.send, {
            apply(target, thisArg, args) {
                if (ws.hooks.beforeSend(args) === false) {
                    return;
                }
                return target.apply(thisArg, args);
            },
        });
        ws.send = sendProxy;
        // Intercept events
        const addEventListenerProxy = new Proxy(ws.addEventListener, {
            apply(target, thisArg, args) {
                if (args[0] === "message" && ws.hooks.beforeReceive(args) === false) {
                    return;
                }
                return target.apply(thisArg, args);
            },
        });
        ws.addEventListener = addEventListenerProxy;
        Object.defineProperty(ws, "onmessage", {
            set(func) {
                const onmessage = function onMessageProxy(event) {
                    if (ws.hooks.beforeReceive(event) === false) {
                        return;
                    }
                    func.call(this, event);
                };
                return addEventListenerProxy.apply(this, ["message", onmessage, false]);
            },
        });
        // Save reference
        window._websockets = window._websockets || [];
        window._websockets.push(ws);
        return ws;
    },
});
window.WebSocket = WebSocketProxy;
