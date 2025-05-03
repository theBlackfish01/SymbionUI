import {create} from 'zustand'

export const useStore = create((set) => ({
    provider:'',
    signer:'',
    updateProvider: (newProvider) => set({ provider: newProvider }),
    updateSigner: (newSigner) => set({ signer: newSigner }),
  }))