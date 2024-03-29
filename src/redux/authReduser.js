import {
  requestLogin,
  requestLogout,
  requestRefreshUser,
  requestRegiser,
  setToken,
} from 'services/api';

import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';


export const loginThunk = createAsyncThunk(
  'auth/login',
  async (formData, thunkAPI) => {
    try {
      const response = await requestLogin(formData);
      return response;
    } catch (error) {
      thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (formData, thunkAPI) => {
    try {
      const response = await requestRegiser(formData);
      return response;
    } catch (error) {
      thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const refreshThunk = createAsyncThunk(
  'auth/refresh',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.auth.token;
    try {
      setToken(token);
      const response = await requestRefreshUser();
      return response;
    } catch (error) {
      thunkAPI.rejectWithValue(error.message);
    }
  },
  {
    condition: (_, thunkAPI) => {
      const state = thunkAPI.getState();
      const token = state.auth.token;

      if (!token) return false;
      return true;
    },
  }
);

export const logOutThunk = createAsyncThunk(
  'auth/logOut',
  async (_, thunkAPI) => {
    try {
      await requestLogout();

      return;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const INITIAL_STATE = {
  token: null,
  user: { email: null, name: null },
  isLoading: false,
  error: null,
  isAuth: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  extraReducers: builder =>
    builder
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.user = action.payload;
      })
      .addCase(logOutThunk.fulfilled, (state, action) => {
        return INITIAL_STATE;
      })
      .addMatcher(
        isAnyOf(
          registerThunk.pending,
          loginThunk.pending,
          refreshThunk.pending,
          logOutThunk.pending
        ),
        state => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          logOutThunk.rejected,
          registerThunk.rejected,
          loginThunk.rejected,
          refreshThunk.rejected
        ),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      ),
});

export const authReducer = authSlice.reducer;
