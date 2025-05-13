import { create } from 'zustand';
import { User } from 'firebase/auth';

interface DesignState {
  selectedElement: string | null;
  canvasObjects: any[];
  user: User | null;
  isAdmin: boolean;
  setSelectedElement: (id: string | null) => void;
  setCanvasObjects: (objects: any[]) => void;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useStore = create<DesignState>((set) => ({
  selectedElement: null,
  canvasObjects: [],
  user: null,
  isAdmin: false,
  setSelectedElement: (id) => set({ selectedElement: id }),
  setCanvasObjects: (objects) => set({ canvasObjects: objects }),
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
})); 