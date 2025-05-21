import { create } from 'zustand';

export const useIntegrationStore = create((set) => ({
  user: 'TestUser',
  org: 'TestOrg',
  currType: null,
  integrationParams: {},
  loadedData: null,

  setUser: (user) => set({ user }),
  setOrg: (org) => set({ org }),
  setCurrType: (currType) => set({ currType, integrationParams: {}, loadedData: null }),
  setIntegrationParams: (params) => set((state) => ({ integrationParams: { ...state.integrationParams, ...params } })),
  setLoadedData: (data) => set({ loadedData: data }),
  clearLoadedData: () => set({ loadedData: null }),
}));