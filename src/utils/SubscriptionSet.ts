type SubscriptionEvent = "add" | "delete";

/**
 * A Set which emits events when it is modified.
 */
class SubscriptionSet<V> {
  #valuesSet: Set<V>;
  #subscribers: Map<SubscriptionEvent, Set<(modifiedValue: V) => void>>;

  constructor() {
    this.#valuesSet = new Set<V>();

    this.#subscribers = new Map<
      SubscriptionEvent,
      Set<(modifiedValue: V) => void>
    >();
    this.#subscribers.set("add", new Set());
    this.#subscribers.set("delete", new Set());
  }

  private _emit(event: SubscriptionEvent, modifiedValue: V) {
    this.#subscribers.get(event)?.forEach((fn) => fn(modifiedValue));
  }

  public subscribe(
    event: SubscriptionEvent | SubscriptionEvent[],
    fn: (modifiedValue: V) => void
  ) {
    if (Array.isArray(event)) {
      event.forEach((e) => this.subscribe(e, fn));
      return;
    }

    this.#subscribers.get(event)!.add(fn);
  }

  public unsubscribe(
    event: SubscriptionEvent | SubscriptionEvent[],
    fn: (modifiedValue: V) => void
  ) {
    if (Array.isArray(event)) {
      event.forEach((e) => this.unsubscribe(e, fn));
      return;
    }

    this.#subscribers.get(event)!.delete(fn);
  }

  /**
   * Note: Does not emit the "add" event if the value already exists.
   */
  public add(value: V) {
    if (this.#valuesSet.has(value)) return this.#valuesSet;
    this.#valuesSet.add(value);
    this._emit("add", value);
    return this.#valuesSet;
  }

  public delete(value: V) {
    const deleted = this.#valuesSet.delete(value);
    if (deleted) this._emit("delete", value);
    return deleted;
  }

  public has(value: V) {
    return this.#valuesSet.has(value);
  }

  public values() {
    return this.#valuesSet.values();
  }
}

export default SubscriptionSet;
