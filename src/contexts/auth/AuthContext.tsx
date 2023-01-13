import { createContext, ReactNode, useEffect, useState } from "react";
import { loginLocalStorage, logoutLocalStorage } from "../../services/auth";
import { messengerServerAPI } from "../../services/MessengerServerAPI/apiClient";

type AuthContextProps = {
    children: ReactNode;
}

interface IUser {
    username: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

interface IAuthContext {
    loading: boolean;
    authenticated: boolean;
    user: IUser| null;
    token: string | null;
    setAuthenticated: (authenticated: boolean) => void;
    setToken: (token: string) => void;
    onLoginSuccess: (res: any) => Promise<boolean>;
    onLoginFailure: (res: any) => boolean;
    onSignoutSuccess: () => boolean;
}

export const intialValue: IAuthContext = {
    loading: false,
    authenticated: false,
    user: null,
    token: null,
    setAuthenticated: () => {},
    setToken: () => {},
    onLoginSuccess: () => { return Promise.resolve(false) },
    onLoginFailure: () => { return false},
    onSignoutSuccess: () => { return false},
}

const AuthContext = createContext<IAuthContext>(intialValue);

function AuthContextProvider ({ children }: AuthContextProps) {
    const [authenticated, setAuthenticated] = useState(intialValue.authenticated);
    const [user, setUser] = useState(intialValue.user);
    const [token, setToken] = useState(intialValue.token);
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        async function loadStorageData() {
            const storagedToken = localStorage.getItem('messenger');

            if (storagedToken) {
                setToken(storagedToken);
                setAuthenticated(true);
                messengerServerAPI.defaults.headers.Authorization = `Bearer ${storagedToken}`;
            }

            setLoading(false);
        }

        loadStorageData();
    }, []);

    async function onLoginSuccess(data: any) {
        console.log({data});

        const { token, user } = data;
        
        if (token) {
            setToken(token);
            loginLocalStorage(token);

            setUser(user);
            setAuthenticated(true);
        }

        messengerServerAPI.defaults.headers.Authorization = `Bearer ${token}`;

        return true
    };

    function onLoginFailure(res: any) {
        setAuthenticated(false);
        logoutLocalStorage()
        setUser(null);
        return true
    };

    function onSignoutSuccess() {
        setAuthenticated(false);
        logoutLocalStorage()
        setUser(null);
        return true
    };

    return (
        <AuthContext.Provider
            value={{
                loading,
                authenticated,
                user,
                token,
                setAuthenticated,
                setToken,
                onLoginSuccess,
                onLoginFailure,
                onSignoutSuccess,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export  { AuthContextProvider };
export default AuthContext;