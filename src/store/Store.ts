import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Un faux reducer pour empêcher Redux de crasher si d'autres composants le cherchent
    pos: (state = {}) => state, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;