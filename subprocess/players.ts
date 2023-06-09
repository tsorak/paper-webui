const onlinePlayers: Set<string> = new Set();
const getAll = () => {
  const keys = onlinePlayers.keys();
  return Array.from(keys);
};

function add(player: string) {
  onlinePlayers.add(player);
}

function remove(player: string) {
  onlinePlayers.delete(player);
}

function clear() {
  onlinePlayers.clear();
}

export { getAll, add, remove, clear };
