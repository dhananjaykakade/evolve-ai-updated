import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
} from 'react';
import { AuthState, AuthAction, Admin } from '@/lib/types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  loading: boolean;
}>({
  state: initialState,
  dispatch: () => {},
  loading: true,
});

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      dispatch({
        type: 'LOGIN',
        payload: {
          user: JSON.parse(user),
          token,
        },
      });
    }
    setLoading(false); // Done loading
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('token', state.token!);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [state]);

  return (
    <AuthContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
