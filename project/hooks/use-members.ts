import { create } from "zustand";
import type { User } from "../types/index";

type State = {
	members: User[];
};

type Action = {
	setMembers: (newMembers: User[]) => void;
};

export const useMembers = create<State & Action>((set) => ({
	members: [],
	setMembers: (newMembers) => set(() => ({ members: newMembers })),
}));
