import React, { useState, ReactNode, useEffect } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tenNhanVien, setTenNhanVien] = useState('');
  const [khoaPhong, setKhoaPhong] = useState('');

  const [decodeWorkerDangNhap] = useState(
    () => new Worker('decodeWorkerDangNhap.js'),
  );

  const navigate = useNavigate();

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
    try {
      const kiemTraDaDangNhapHayChua = async () => {
        let token = localStorage.getItem('token');
        if (!token) {
          navigate('/dang-nhap');
        }
        let decodeDangNhap: any = await handleDecodeDangNhap(token);

        setTenNhanVien(decodeDangNhap?.tennhanvien);
        setKhoaPhong(decodeDangNhap?.khoaphong);
      };
      kiemTraDaDangNhapHayChua();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            tennhanvien={tenNhanVien}
            khoaphong={khoaPhong}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <UserContext.Provider value={{ tenNhanVien, khoaPhong }}>
                {children}
              </UserContext.Provider>
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default DefaultLayout;
