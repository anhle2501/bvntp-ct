import React, { useState, useEffect } from 'react';
import './ChecklistTable.css'; // Giả sử bạn có file CSS riêng
import {
  DanhSachKhoaPhong,
  DanhSachPhanQuyenTieuChi,
  PhanQuyenTieuChi,
} from '../../api/TieuChiKhoaPhongAPI';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhSachDanhMuc } from '../../api/ChiTieuAPI';
import { Link, useNavigate } from 'react-router-dom';

const DEPARTMENT_COUNT = 55;
const CRITERIA_COUNT = 83;

interface ChecklistState {
  [key: string]: boolean;
}

const ChecklistTable: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [savedChecklist, setSavedChecklist] = useState<ChecklistState>({});
  const [dataKhoaPhong, setDataKhoaPhong] = useState<string[]>([]);
  const [loadingTieuChiKhoaPhong, setLoadingTieuChiKhoaPhong] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [khoaPhong, setKhoaPhong] = useState('');
  const [availableCriteria, setAvailableCriteria] = useState<number[]>([]);
  const [danhSachDot, setDanhSachDot] = useState<any[]>([]);
  const [dotDuocChon, setDotDuocChon] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // First add a new state to store the permission data
  const [phanQuyenData, setPhanQuyenData] = useState<any[]>([]);

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

  const renderDanhSachDot = () => (
    <select
      value={dotDuocChon}
      onChange={(e) => setDotDuocChon(e.target.value)}
      className="bg-white border p-2 rounded"
    >
      {danhSachDot && danhSachDot.length > 0 ? (
        danhSachDot
          .sort(
            (a, b) =>
              new Date(b.thoi_gian_ghi_nhan).getTime() -
              new Date(a.thoi_gian_ghi_nhan).getTime(),
          )
          .map((dot) => (
            <option key={dot._id} value={dot._id}>
              {new Date(dot.thoi_gian_ghi_nhan).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </option>
          ))
      ) : (
        <option value="">Không tìm thấy đợt nào</option>
      )}
    </select>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://172.16.0.60:83/api/phan_quyen');
        const data = await response.json();
        setDanhSachDot(data);

        // Mặc định chọn đợt mới nhất
        if (data.length > 0) {
          setDotDuocChon(data[0]._id);
        }
      } catch (error) {
        messageApi.error('Lỗi khi tải dữ liệu');
      }
    };
    fetchData();
  }, []);

  // Add this useEffect to fetch permission data
  useEffect(() => {
    const fetchPhanQuyen = async () => {
      try {
        const data = await DanhSachPhanQuyenTieuChi();
        setPhanQuyenData(data);
        setLoadingTieuChiKhoaPhong(false);
      } catch (error) {
        messageApi.error('Lỗi khi tải dữ liệu phân quyền');
      }
    };
    fetchPhanQuyen();
  }, []);

  useEffect(() => {
    setColors(generateColors(DEPARTMENT_COUNT));
  }, []);

  useEffect(() => {
    setColors(generateColors(dataKhoaPhong.length));
    const savedChecklistData = localStorage.getItem('savedChecklist');
    if (savedChecklistData) {
      setSavedChecklist(JSON.parse(savedChecklistData));
    }
  }, [dataKhoaPhong]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data = await DanhSachKhoaPhong();
        if (data) {
          setDataKhoaPhong(data);
          setLoadingTieuChiKhoaPhong(false);
        }
      } catch (error) {
        console.log(error);
        messageApi.open({
          type: 'error',
          content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
        });
      }
    };
    fetchData();
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

  useEffect(() => {
    fetchAvailableCriteria();
  }, []);

  const generateColors = (numColors: number): string[] => {
    return Array.from({ length: numColors }, (_, i) => {
      const hue = Math.floor((i * 360) / numColors);
      return `hsl(${hue}, 70%, 80%)`;
    });
  };

  const fetchAvailableCriteria = async () => {
    try {
      let data = await DanhSachDanhMuc();
      if (data) {
        const criteriaNumbers: number[] = [];
        data.danh_muc.forEach((danhMuc: any) => {
          danhMuc.cac_tieu_muc.forEach((tieuMuc: any) => {
            tieuMuc.cac_tieu_muc_con.forEach((tieuMucCon: any) => {
              const number = parseInt(tieuMucCon.so_tieu_muc_con);
              if (!isNaN(number)) {
                criteriaNumbers.push(number);
              }
            });
          });
        });
        setAvailableCriteria(criteriaNumbers);
      }
    } catch (error) {
      messageApi.error('Lỗi khi tải danh sách tiêu chí');
    }
  };

  const renderTableHeader = () => (
    <tr>
      <th className="sticky-header sticky-column">Khoa Phòng</th>
      {Array.from({ length: CRITERIA_COUNT }, (_, i) => (
        <th key={`criteria-${i + 1}`} className="sticky-header">
          {i + 1}
        </th>
      ))}
    </tr>
  );

  const kiemTraQuyenTieuChi = (tenKhoaPhong: string, soTieuChi: number) => {
    const dotHienTai = danhSachDot.find((dot) => dot._id === dotDuocChon);
    if (!dotHienTai) return false;

    const khoaPhongData = dotHienTai.phan_quyen.find(
      (k: any) => k.ten_khoa === tenKhoaPhong,
    );
    if (!khoaPhongData) return false;

    return khoaPhongData.danh_sach_tieu_chi.some(
      (tieuChi: any) => tieuChi.so_tieuchi === soTieuChi,
    );
  };

  const renderTableBody = () =>
    dataKhoaPhong.map((item: any, i) => (
      <tr key={`department-${i + 1}`} style={{ backgroundColor: colors[i] }}>
        <td className="sticky-column">{item.TENGOIKHOAPHONG}</td>
        {Array.from({ length: CRITERIA_COUNT }, (_, j) => {
          const soTieuChi = j + 1;
          const checkboxId = `tieuchi_${soTieuChi}_khoa_${item.MAKHOAPHONG}`;
          const coSanTieuChi = availableCriteria.includes(soTieuChi);

          return (
            <td key={checkboxId}>
              <input
                title={
                  !coSanTieuChi ? `Tiêu chí ${soTieuChi} chưa được tạo` : ''
                }
                type="checkbox"
                id={checkboxId}
                checked={
                  isCreatingNew
                    ? checklist[checkboxId] || false
                    : checklist[checkboxId] ??
                      kiemTraQuyenTieuChi(item.TENGOIKHOAPHONG, soTieuChi)
                }
                onChange={(e) => {
                  if (isCreatingNew) {
                    const newValue = e.target.checked;
                    setChecklist((prev) => ({
                      ...prev,
                      [checkboxId]: newValue,
                    }));
                  }
                }}
                disabled={!isCreatingNew || !coSanTieuChi}
                style={{ opacity: coSanTieuChi ? 1 : 0.5 }}
              />
            </td>
          );
        })}
      </tr>
    ));

  const handleSaveChecklist = async () => {
    try {
      // Check if any checkbox is selected
      const hasSelectedCheckbox = Object.values(checklist).some(
        (value) => value === true,
      );

      if (!hasSelectedCheckbox) {
        messageApi.error('Vui lòng chọn ít nhất một tiêu chí trước khi lưu');
        return;
      }

      let phanQuyen = [];

      for (const khoaPhong of dataKhoaPhong) {
        const { TENGOIKHOAPHONG, MAKHOAPHONG } = khoaPhong as unknown as {
          TENGOIKHOAPHONG: string;
          MAKHOAPHONG: string;
        };

        let selectedTieuChi = [];

        // Chỉ kiểm tra các checkbox trong state checklist hiện tại
        for (let soTieuChi = 1; soTieuChi <= CRITERIA_COUNT; soTieuChi++) {
          const checkboxId = `tieuchi_${soTieuChi}_khoa_${MAKHOAPHONG}`;
          if (checklist[checkboxId]) {
            selectedTieuChi.push(soTieuChi);
          }
        }

        if (selectedTieuChi.length > 0) {
          phanQuyen.push({
            ten_khoa: TENGOIKHOAPHONG,
            danh_sach_tieu_chi: selectedTieuChi,
          });
        }
      }

      const requestData = {
        phan_quyen: phanQuyen,
      };

      await PhanQuyenTieuChi(requestData);
      window.location.reload();
      messageApi.success('Đã lưu checklist thành công');

      setIsCreatingNew(false);
    } catch (error) {
      messageApi.error('Có lỗi xảy ra khi lưu checklist');
    }
  };

  const getLatestChecklist = () => {
    if (danhSachDot.length > 0) {
      const latestDot = danhSachDot[0]; // Get latest dot since list is already sorted
      const newChecklist: ChecklistState = {};

      dataKhoaPhong.forEach((khoaPhong: any) => {
        latestDot.phan_quyen.forEach((pq: any) => {
          if (pq.ten_khoa === khoaPhong.TENGOIKHOAPHONG) {
            pq.danh_sach_tieu_chi.forEach((tieuChi: any) => {
              const checkboxId = `tieuchi_${
                tieuChi.so_tieuchi || tieuChi
              }_khoa_${khoaPhong.MAKHOAPHONG}`;
              newChecklist[checkboxId] = true;
            });
          }
        });
      });

      return newChecklist;
    }

    return {};
  };

  return (
    <>
      <div className="relative w-full">
        {contextHolder}
        {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
          <>
            <div className="container">
              <h1>Checklist Khoa Phòng</h1>
              {loadingTieuChiKhoaPhong === false ? (
                <>
                  <div className="flex gap-2 items-center mb-4">
                    {isCreatingNew ? (
                      <>
                        <button
                          onClick={() => {
                            setIsCreatingNew(false);
                            setChecklist({});
                          }}
                          className="bg-primary mt-3 mb-3 p-3 text-white rounded-md"
                        >
                          Chọn đợt
                        </button>
                        <button
                          onClick={handleSaveChecklist}
                          className="bg-primary mt-3 mb-3 p-3 text-white rounded-md"
                        >
                          Lưu thông tin
                        </button>
                      </>
                    ) : (
                      <>
                        {renderDanhSachDot()}
                        <button
                          onClick={() => {
                            setIsCreatingNew(true);
                            setChecklist(getLatestChecklist());
                          }}
                          className="bg-primary mt-3 mb-3 p-3 ml-5 text-white rounded-md"
                        >
                          Tạo mới
                        </button>
                      </>
                    )}
                  </div>

                  <div className="relative overflow-auto w-full">
                    <div className="inline-block min-w-full">
                      <div className="overflow-x-auto">
                        <table
                          // id="checklist-table"
                          // className="min-w-full divide-y divide-gray-200"
                          // className="w-full table-auto border-collapse"
                          className="min-w-full"
                        >
                          <thead>{renderTableHeader()}</thead>
                          <tbody>{renderTableBody()}</tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <LoadingOutlined style={{ fontSize: '50px' }} />
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Result
              status="403"
              title="403"
              subTitle="Bạn không có quyền truy cập trang này"
              extra={
                <Link to={'/danh-sach-tieu-chi'}>
                  <button className="hover:bg-primary bg-primary p-2 text-white rounded">
                    Quay lại trang chủ
                  </button>
                </Link>
              }
            />
          </>
        )}
      </div>
    </>
  );
};

export default ChecklistTable;
