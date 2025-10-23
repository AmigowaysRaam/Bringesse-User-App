/* config.js */
import { HOC as HocConfigure } from 'react-boilerplate-redux-saga-hoc';
import { API_REQUESTS } from '../api/api-end-points';
import axios from '../api/axios';
const HOC = HocConfigure({
  handlers: [],
  useHocHook: true /* This will help us to use hoc as a hook */,
});
const TEST_API = 'https://jsonplaceholder.typicode.com/posts/'; /* Default method GET */
const useAuthHoc = HOC({
  initialState: {
    isLoggedIn: false,
    isFirstTime: false,
    profile: {},
    accessToken: null,
    refreshToken: null,
    siteDetails: {},          // <-- Added siteDetails here
    profileDetails: {},

  },
  dontReset: {
    TEST_API /* If you pass anything on don't reset it wont reset the particular state on setting to reset */,
  },
  apiEndPoints: API_REQUESTS,
  axiosInterceptors: axios,
  constantReducer: ({ type, state, resetState, action }) => {
    /* For handling custom action */
    switch (type) {
      case 'UPDATE_PROFILE':
        return {
          ...state,
          profile: action.payload,
        };

        case 'SET_TOKENS':
          console.log('[TOKEN BINDING] Access Token:', action?.payload?.access_token);
          console.log('[TOKEN BINDING] Refresh Token:', action?.payload?.refresh_token);
          return {
            ...state,
            accessToken: action.payload.access_token,
            refreshToken: action.payload.refresh_token,
          };
        

      case 'SET_SITE_DETAILS':          // <-- New action to set site details
        return {
          ...state,
          siteDetails: action.payload,
        };
        // profileDetails
        case 'PROFILE_DETAILS':          // <-- New action to set site details
        return {
          ...state,
          profileDetails: action.payload,
        };
      case 'logout':
        return resetState;

      default:
        return state;
    }
  },
  name: 'Auth' /* Reducer name */,
});

export { useAuthHoc };

export { useQuery } from 'react-boilerplate-redux-saga-hoc';
