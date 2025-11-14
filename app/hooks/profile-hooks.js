import _ from 'lodash';
import { useSelector } from 'react-redux';
const UseProfileHook = () => {
  const profile = useSelector(state => state.Auth.profileDetails);
  return {
    profile: profile,
  };
};
export default UseProfileHook;
