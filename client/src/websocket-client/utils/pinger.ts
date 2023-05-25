import { CS } from "../socket";

export default function setupPinger(socket: CS) {
  return {
    interval: undefined as unknown as NodeJS.Timeout,
    start: function () {
      if (socket.readyState !== 1) return;
      this.interval = setInterval(() => {
        socket.lastPing = new Date().getTime();
        socket.json({ type: "ping" });
      }, 5000);
    },
    stop: function () {
      clearInterval(this.interval);
    }
  };
}
