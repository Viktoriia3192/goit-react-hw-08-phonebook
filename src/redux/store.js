import { configureStore } from '@reduxjs/toolkit';
import { contactsReducer } from './contacts';


export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
  },
});
export const persistor = store;
