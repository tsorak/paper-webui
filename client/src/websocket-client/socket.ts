import { WS } from "../../../src/websocket-server/ws";
import setupHandlers from "./handlers";

import * as runner from "./emit/runner";
import * as mc_cmd from "./emit/mc_cmd";

export interface CS extends WS {
  pinger?: {
    interval?: NodeJS.Timeout;
    start: () => void;
    stop: () => void;
  };
  lastPing?: number;
  latency?: number;
}

const socket = {
  instance: undefined as unknown as CS,

  connect: function () {
    if (!this.instance) {
      const _socket = this.createInstance();
      const socket = setupHandlers(_socket, this.reconnect.bind(this));

      this.instance = socket;
      return this.instance;
    }
    return this.instance;
  },

  createInstance: () => {
    const wsEndpoint = new URL(location.origin);
    wsEndpoint.protocol = "ws:";

    const _socket = new WebSocket(wsEndpoint);
    return _socket;
  },

  disconnect: function (reason?: string, code?: number) {
    if (this.instance) {
      this.instance.close(code ?? 1000, reason);
      this.instance = undefined as unknown as CS;
    }
  },

  reconnect: function () {
    this.instance = undefined as unknown as CS;
    this.connect();
  },
};

export default socket;

export const emit = {
  runner: {
    start: runner.start,
    restart: runner.restart,
    stop: runner.stop,
  },
  mc: {
    command: mc_cmd.command,
  },
};
