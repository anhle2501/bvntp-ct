import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import DefaultLayout from './layout/DefaultLayout';
import ChiTieuCap1 from './pages/ChiTieu/ChiTieuCap1';
import ChecklistTable from './pages/ChiTieu/ChecklistTable';
import ChiTieuTheoKhoa from './pages/ChiTieu/ChiTieuTheoKhoa';
import DanhGiaTieuChiKhoaPhong from './pages/ChiTieu/DanhGiaTieuChiKhoaPhong';
import DanhSachDanhGiaCuaKhoa from './pages/ChiTieu/DanhSachDanhGiaCuaKhoa';
import DetailsChiTieu from './pages/ChiTieu/DetailsChiTieu';
import NotFound from './pages/NotFound/NotFound';
import { message } from 'antd';
import LichSuThaoTac from './pages/ChiTieu/LichSuThaoTac';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  const [messageApi, contextHolder] = message.useMessage();

  const [khoaPhong, setKhoaPhong] = useState('');

  const navigate = useNavigate();

  const [decodeWorkerDangNhap] = useState(
    () => new Worker('./decodeWorkerDangNhap.js'),
  );

  const handleDecodeDangNhap = (encodedString: any) => {
    return new Promise((resolve, reject) => {
      if (decodeWorkerDangNhap) {
        decodeWorkerDangNhap.postMessage(encodedString);
        decodeWorkerDangNhap.onmessage = function (e) {
          resolve(e.data);
        };
      } else {
        console.log('Giải mã thông tin đăng nhập không thành công');
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    try {
      const kiemTraDaDangNhaphayChua = async () => {
        let token = localStorage.getItem('token');
        if (!token) {
          navigate('/dang-nhap');
        }
        let decodeDangNhap: any = await handleDecodeDangNhap(token);
        setKhoaPhong(decodeDangNhap?.khoaphong);
      };
      kiemTraDaDangNhaphayChua();
    } catch (error) {
      console.log(error);

      messageApi.open({
        type: 'error',
        content: `Đã xảy ra lỗi trong quá trình kiểm tra đăng nhập`,
      });
    }
  }, []);

  return loading ? (
    <Loader />
  ) : pathname === '/dang-nhap' ? (
    <SignIn />
  ) : (
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
          path="*"
          element={
            <>
              <PageTitle title="404 Not Found" />
              <NotFound />
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
                <>
                  <PageTitle title="Quản lý tiêu chí | NTP" />
                  <ChiTieuCap1 />
                </>
              ) : (
                <>
                  <PageTitle title="Danh sách tiêu chí | NTP" />
                  <ChiTieuTheoKhoa />
                </>
              )}
            </>
          }
        />
        <Route
          path="/lich-su-thao-tac"
          element={
            <>
              <PageTitle title="Lịch sử thao tác | NTP" />
              <LichSuThaoTac />
            </>
          }
        />
        <Route
          path="/quan-ly-tieu-chi"
          element={
            <>
              <PageTitle title="Quản lý tiêu chí | NTP" />
              <ChiTieuCap1 />
            </>
          }
        />
        <Route
          path="/phan-quyen-tieu-chi"
          element={
            <>
              <PageTitle title="Phân quyền tiêu chí | NTP" />
              <ChecklistTable />
            </>
          }
        />
        <Route
          path="/danh-sach-tieu-chi"
          element={
            <>
              <PageTitle title="Danh sách tiêu chí | NTP" />
              <ChiTieuTheoKhoa />
            </>
          }
        />
        <Route
          path="/danh-gia-tieu-chi"
          element={
            <>
              <PageTitle title="Đánh giá tiêu chí khoa phòng | NTP" />
              <DanhGiaTieuChiKhoaPhong />
            </>
          }
        />
        <Route
          path="/danh-sach-dot-danh-gia-cua-cac-khoa"
          element={
            <>
              <PageTitle title="Danh sách đợt đánh giá của các khoa | NTP" />
              <DanhSachDanhGiaCuaKhoa />
            </>
          }
        />
        <Route
          path="/chi-tiet-dot-danh-gia/:dotId"
          element={
            <>
              <PageTitle title="Chi tiết đợt đánh giá | NTP" />
              <DetailsChiTieu />
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
