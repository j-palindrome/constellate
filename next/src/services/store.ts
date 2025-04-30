import { create } from 'zustand'

// Define the store's state interface
interface StoreState {
  convertedItems: DACSRecord[]
}

// Create the store
export const useAppStore = create<StoreState>(set => ({
  convertedItems: []
}))

export const setters = {
  setConvertedItems: items => useAppStore.setState({ convertedItems: items }),
  addItem: item =>
    useAppStore.setState(state => ({
      convertedItems: [...state.convertedItems, item]
    })),
  removeItem: id =>
    useAppStore.setState(state => ({
      convertedItems: state.convertedItems.filter(
        item => item.identifier !== id
      )
    })),
  clearItems: () => useAppStore.setState({ convertedItems: [] })
}
