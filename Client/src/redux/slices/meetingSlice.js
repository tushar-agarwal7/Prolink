// Client/src/redux/slices/meetingSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi } from '../../services/api'

export const fetchMeetingData = createAsyncThunk('fetchMeetingData', async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
        const response = await getApi(user.role === 'superAdmin' ? 'api/meeting/' : `api/meeting/?createBy=${user._id}`);
        return response;
    } catch (error) {
        console.error('Error fetching meeting data:', error);
        throw error;
    }
});

const meetingSlice = createSlice({
    name: 'meetingData',
    initialState: {
        data: [],
        isLoading: false,
        error: "",
    },
    reducers: {
        // Add synchronous actions if needed
        clearMeetingError: (state) => {
            state.error = "";
        },
        resetMeetingData: (state) => {
            state.data = [];
            state.isLoading = false;
            state.error = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeetingData.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(fetchMeetingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload?.data || [];
                state.error = "";
            })
            .addCase(fetchMeetingData.rejected, (state, action) => {
                state.isLoading = false;
                state.data = [];
                state.error = action.error.message || "Failed to fetch meetings";
            });
    },
});

export const { clearMeetingError, resetMeetingData } = meetingSlice.actions;
export default meetingSlice.reducer;