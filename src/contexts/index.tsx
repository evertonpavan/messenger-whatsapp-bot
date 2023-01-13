import { AuthContextProvider } from "./auth/AuthContext";

const AuthContext = ({ children }: any) => {
    return (
        <>
            <AuthContextProvider> {children} </AuthContextProvider>
        </>
    )
}

export { AuthContext };