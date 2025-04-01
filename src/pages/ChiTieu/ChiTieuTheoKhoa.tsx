import { useEffect, useState, Fragment } from 'react';
import './ChiTieuCap1.css';
import { message, Result } from 'antd';
import { LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

const ChiTieuTheoKhoa: React.FC = () => {
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);
  const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
    DanhMuc[]
  >([]);
  const [khoaPhong, setKhoaPhong] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [danhSachDot, setDanhSachDot] = useState<any[]>([]);
  const [selectedDot, setSelectedDot] = useState<string>('');

  const navigate = useNavigate();

  const [decodeWorkerDangNhap] = useState(
    () => new Worker('/decodeWorkerDangNhap.js'),
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const layDanhSachDotTheoKhoa = async () => {
    try {
      const response = await axios.get('http://172.16.0.60:83/api/phan_quyen');
      if (response.data) {
        const dotTheoKhoa = response.data
          .filter((item: any) => {
            return item.phan_quyen.some((pq: any) => pq.ten_khoa === khoaPhong);
          })
          .map((item: any) => ({
            value: formatDate(item.thoi_gian_ghi_nhan),
            label: formatDate(item.thoi_gian_ghi_nhan),
          }));

        setDanhSachDot(dotTheoKhoa);
      }
    } catch (error) {
      messageApi.error('Lỗi khi tải danh sách đợt đánh giá');
    }
  };

  useEffect(() => {
    if (khoaPhong) {
      layDanhSachDotTheoKhoa();
    }
  }, [khoaPhong]);

  useEffect(() => {
    try {
      const kiemTraDaDangNhapHayChua = async () => {
        let token = localStorage.getItem('token');
        if (!token) {
          navigate('/dang-nhap');
        }

        let decodeDangNhap: any = await handleDecodeDangNhap(token);
        setKhoaPhong(decodeDangNhap?.khoaphong);
      };
      kiemTraDaDangNhapHayChua();
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã xảy ra lỗi trong quá trình kiểm tra đăng nhập`,
      });
    }
  }, [khoaPhong]);

  const handleDotChange = (selectedOption: any) => {
    setLoadingDanhMuc(true);
    setSelectedDot('');
    setTimeout(() => {
      setSelectedDot(selectedOption ? selectedOption.value : '');
    }, 0);
  };

  const fetchDataTieuChiTheoKhoa = async () => {
    try {
      let data = await DanhSachPhanQuyenTieuChi();

      if (data && Array.isArray(data)) {
        let targetPhanQuyen;

        if (selectedDot) {
          targetPhanQuyen = data.find(
            (record) => formatDate(record.thoi_gian_ghi_nhan) === selectedDot,
          )?.phan_quyen;
        } else {
          targetPhanQuyen = data[0]?.phan_quyen;
        }

        const khoaData = targetPhanQuyen?.find(
          (item: any) => item.ten_khoa === khoaPhong,
        );

        if (khoaData && Array.isArray(khoaData.danh_sach_tieu_chi)) {
          setDanhSachTieuChiTheoKhoa(khoaData.danh_sach_tieu_chi);
          setLoadingDanhMuc(false);
        } else {
          setDanhSachTieuChiTheoKhoa([]);
          setLoadingDanhMuc(false);
        }
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
      });
      setLoadingDanhMuc(false);
    }
  };

  useEffect(() => {
    if (khoaPhong) {
      fetchDataTieuChiTheoKhoa();
    }
  }, [khoaPhong, selectedDot]);

  return (
    <>
      {contextHolder}
      {khoaPhong !== 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xl sm:text-2xl font-bold mb-4">
              Danh mục tiêu chí {khoaPhong}
            </div>
            <br />
            <div className="w-full mb-6">
              <Select
                isDisabled={false}
                value={
                  selectedDot
                    ? {
                        value: selectedDot,
                        label: selectedDot,
                      }
                    : null
                }
                options={danhSachDot.map((dot: any) => ({
                  value: dot.value,
                  label: dot.label,
                }))}
                placeholder="Chọn đợt"
                isClearable={true}
                onChange={handleDotChange}
                className="w-full sm:w-1/2 mb-4"
              />
            </div>
            <br />

            {selectedDot && (
              <>
                <div className="overflow-auto" style={{ maxWidth: '100%' }}>
                  <table
                    className="w-full border-collapse border"
                    style={{ tableLayout: 'fixed', minWidth: '768px' }}
                  >
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th
                          className="border p-3 text-center font-semibold bg-purple-800"
                          style={{
                            width: '80%',
                            wordWrap: 'break-word',
                            overflow: 'visible',
                            whiteSpace: 'normal',
                          }}
                        >
                          Nội dung
                        </th>
                        <th
                          className="border p-3 text-center font-semibold bg-yellow-800"
                          style={{ width: '20%' }}
                        >
                          Mức
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhSachTieuChiTheoKhoa &&
                      Array.isArray(danhSachTieuChiTheoKhoa) &&
                      danhSachTieuChiTheoKhoa.length > 0 ? (
                        <>
                          {danhSachTieuChiTheoKhoa
                            .filter((tc) => tc.hidden === 0)
                            .map((tieuChi) => (
                              <Fragment key={tieuChi.id_tieuchi}>
                                <tr className="bg-blue-700 text-white hover:bg-blue-800">
                                  <td
                                    className="border p-3 font-medium"
                                    style={{
                                      wordWrap: 'break-word',
                                      overflow: 'visible',
                                      whiteSpace: 'normal',
                                      maxWidth: '0',
                                    }}
                                    colSpan={2}
                                  >
                                    {tieuChi.ten_tieuchi}{' '}
                                    {tieuChi.mo_ta ? ` - ${tieuChi.mo_ta}` : ''}
                                  </td>
                                </tr>

                                {tieuChi.cac_tieu_muc &&
                                  Array.isArray(tieuChi.cac_tieu_muc) &&
                                  tieuChi.cac_tieu_muc
                                    .filter((tm) => tm.hidden === 0)
                                    .map((tieuMuc) => (
                                      <Fragment key={tieuMuc.id_tieumuc}>
                                        {tieuMuc.ten_tieu_muc && (
                                          <tr className="bg-indigo-600 text-white hover:bg-indigo-700">
                                            <td
                                              className="border p-3 pl-8"
                                              style={{
                                                wordWrap: 'break-word',
                                                overflow: 'visible',
                                                whiteSpace: 'normal',
                                                maxWidth: '0',
                                              }}
                                              colSpan={2}
                                            >
                                              {tieuMuc.ten_tieu_muc}{' '}
                                              {tieuMuc.mo_ta_tieu_muc
                                                ? `- ${tieuMuc.mo_ta_tieu_muc}`
                                                : ''}
                                            </td>
                                          </tr>
                                        )}

                                        {tieuMuc.cac_tieu_muc_con &&
                                          Array.isArray(
                                            tieuMuc.cac_tieu_muc_con,
                                          ) &&
                                          tieuMuc.cac_tieu_muc_con
                                            .filter((tmc) => tmc.hidden === 0)
                                            .map((tieuMucCon) => (
                                              <tr
                                                key={tieuMucCon.id_tieumuccon}
                                                className="bg-teal-600 text-white hover:bg-teal-700"
                                              >
                                                <td
                                                  className="border p-3 pl-12 text-left"
                                                  style={{
                                                    wordWrap: 'break-word',
                                                    overflow: 'visible',
                                                    whiteSpace: 'normal',
                                                    maxWidth: '0',
                                                  }}
                                                >
                                                  {tieuMucCon.ten_tieu_muc_con}{' '}
                                                  {tieuMucCon.mo_ta_tieu_muc_con
                                                    ? ` - ${tieuMucCon.mo_ta_tieu_muc_con}`
                                                    : ''}
                                                </td>
                                                <td className="border p-3 text-center">
                                                  {tieuMucCon.muc}
                                                </td>
                                              </tr>
                                            ))}
                                      </Fragment>
                                    ))}
                              </Fragment>
                            ))}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={2} className="border p-4 text-center">
                            {loadingDanhMuc ? (
                              <div className="flex justify-center items-center">
                                <LoadingOutlined
                                  style={{ fontSize: '24px' }}
                                  className="mr-2"
                                />{' '}
                                Đang tải dữ liệu...
                              </div>
                            ) : (
                              'Không tìm thấy tiêu chí nào'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
          extra={<Link to="/">Quay lại Trang chủ</Link>}
        />
      )}
    </>
  );
};

export default ChiTieuTheoKhoa;
