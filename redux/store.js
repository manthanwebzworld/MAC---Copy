// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import permissionsReducer from "./slices/permissionSlice";

export const store = configureStore({
  reducer: {
    permissions: permissionsReducer,
  },
});
