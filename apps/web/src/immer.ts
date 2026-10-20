import { setAutoFreeze } from "immer";

// recharts keeps chart data in a Redux Toolkit store, and Immer deep-freezes
// everything that goes into it, including diagram objects referenced from
// the data. Our own state lives in MobX, and recharts works without freezing.
setAutoFreeze(false);
