import _ from 'lodash';
import { useSelector } from 'react-redux';
const UseProfileHook = () => {
  const profile = useSelector(state => state.Auth.profile);
  return {
    profile: profile,
  };
};
export default UseProfileHook;
