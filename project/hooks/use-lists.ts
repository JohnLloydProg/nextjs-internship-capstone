import { create } from "zustand";
import type { List } from "../types/index";

type ListsUpdater = List[] | ((current: List[]) => List[]);

type State = {
	lists: List[];
};

type Action = {
	setLists: (update: ListsUpdater) => void;
};

export const useLists = create<State & Action>((set) => ({
	lists: [],
	setLists: (update) =>
		set((state) => ({
			lists: typeof update === "function" ? update(state.lists) : update,
		})),
}));
