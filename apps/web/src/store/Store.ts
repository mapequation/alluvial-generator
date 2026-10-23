import { DiagramStore } from "@mapequation/alluvial-diagram";
import { createContext } from "react";

// Everything the app needs lives in DiagramStore; add app-only state here.
// The app uses the package defaults (identifier "id", "C3 Oklch" colors in the "vivid" tone).
export class Store extends DiagramStore {}

export const StoreContext = createContext(new Store());
