import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import DefaultLayout from './layout/DefaultLayout';
import ChiTieuCap1 from './pages/ChiTieu/ChiTieuCap1';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (pathname === '/login') ?  <SignIn /> :(
    <DefaultLayout>
      <Routes>
         {/* <Route
          index
          element={
            <>
              <PageTitle title="eCommerce Dashboard | NTP - Tailwind CSS Admin Dashboard Template" />
              <ECommerce />
            </>
          }
        /> */}
        {/* <Route
          path="/calendar"
          element={
            <>
              <PageTitle title="Calendar | NTP - Tailwind CSS Admin Dashboard Template" />
              <Calendar />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile | NTP - Tailwind CSS Admin Dashboard Template" />
              <Profile />
            </>
          }
        /> */}
        {/* <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | NTP - Tailwind CSS Admin Dashboard Template" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | NTP - Tailwind CSS Admin Dashboard Template" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables | NTP - Tailwind CSS Admin Dashboard Template" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | NTP - Tailwind CSS Admin Dashboard Template" />
              <Settings />
            </>
          }
        /> */}
        {/* <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart | NTP - Tailwind CSS Admin Dashboard Template" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | NTP - Tailwind CSS Admin Dashboard Template" />
              <Alerts />
            </>
          }
        /> */}
        {/* <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | NTP - Tailwind CSS Admin Dashboard Template" />
              <Buttons />
            </>
          }
        /> */}
        <Route
          path="/chi-tieu"
          element={
            <>
              <PageTitle title="Chỉ tiêu | NTP" />
              <ChiTieuCap1/>
            </>
          }
        />
         {/* <Route
          path="/chi-tieu-cap-2"
          element={
            <>
              <PageTitle title="Chỉ tiêu cấp 2 | NTP " />
              <ChiTieuCap2/>
            </>
          }
        />
         <Route
          path="/chi-tieu-cap-3"
          element={
            <>
              <PageTitle title="Chỉ tiêu cấp 3 | NTP " />
              <ChiTieuCap3/>
            </>
          }
        /> */}

        {/* <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | NTP - Tailwind CSS Admin Dashboard Template" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | NTP - Tailwind CSS Admin Dashboard Template" />
              <SignUp />
            </>
          }
        /> */}
      </Routes>
    </DefaultLayout>
  );
}

export default App;
