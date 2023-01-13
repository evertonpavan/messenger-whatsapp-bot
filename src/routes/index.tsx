import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpinnerLoading } from "../components/SpinnerLoading";
import { Home } from "../pages/Home";

export const CustomRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        {/* <Route
          path="*"
          element={
            <>
              <SpinnerLoading />
              <Navigate to="/login" />
            </>
          }
          /> */}
      </Routes>
    </BrowserRouter>
  );
};
