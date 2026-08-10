import { create } from "zustand";
import type { List } from "../types/index";

type State = {
	lists: List[];
};

type Action = {
	setLists: (newLists: List[]) => void;
};

export const useLists = create<State & Action>((set) => ({
	lists: [],
	setLists: (newLists: List[]) => set(() => ({ lists: newLists })),
}));
