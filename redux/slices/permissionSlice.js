// redux/slices/permissionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const permissionSlice = createSlice({
  name: "permissions",
  initialState: { permissions: {} },
  reducers: {
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
  },
});

export const { setPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
