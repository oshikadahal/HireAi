import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

const storedToken = localStorage.getItem('hireai_token');
const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('hireai_user') || 'null');
  } catch {
    return null;
  }
})();

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerCandidate = createAsyncThunk('auth/registerCandidate', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register/candidate', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const registerHR = createAsyncThunk('auth/registerHR', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register/hr', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const persist = (token, user) => {
  localStorage.setItem('hireai_token', token);
  localStorage.setItem('hireai_user', JSON.stringify(user));
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('hireai_token');
      localStorage.removeItem('hireai_user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('hireai_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    const onSuccess = (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      persist(action.payload.token, action.payload.user);
    };
    const onPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const onError = (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(action.payload || 'Something went wrong');
    };

    builder
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onSuccess)
      .addCase(loginUser.rejected, onError)
      .addCase(registerCandidate.pending, onPending)
      .addCase(registerCandidate.fulfilled, onSuccess)
      .addCase(registerCandidate.rejected, onError)
      .addCase(registerHR.pending, onPending)
      .addCase(registerHR.fulfilled, onSuccess)
      .addCase(registerHR.rejected, onError)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('hireai_user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('hireai_token');
        localStorage.removeItem('hireai_user');
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
