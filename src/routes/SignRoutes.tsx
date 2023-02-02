import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";


export const SignRoutes = () => {

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};
