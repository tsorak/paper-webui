import { useViewContext } from "./context/viewContext";

export default function setupWindowListeners(w: Window) {
  hashChange(w);
}

function hashChange(w: Window) {
  w.addEventListener("hashchange", (e) => {
    const hash = e.newURL.split("#")[1];
    const { setView } = useViewContext();
    setView(hash);
  });
}
