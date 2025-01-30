import React, { useState, useEffect, useContext } from 'react';
import './ChecklistTable.css'; // Giả sử bạn có file CSS riêng
import {
  DanhSachKhoaPhong,
  PhanQuyenTieuChi,
} from '../../api/TieuChiKhoaPhongAPI';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhSachDanhMuc } from '../../api/ChiTieuAPI';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';

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

  const [availableCriteria, setAvailableCriteria] = useState<number[]>([]);

  const { khoaPhong } = useContext(UserContext);

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
    const savedChecklistData = localStorage.getItem('savedChecklist');
    if (savedChecklistData) {
      const parsedChecklist = JSON.parse(savedChecklistData);
      setChecklist(parsedChecklist);
      setSavedChecklist(parsedChecklist);
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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    setChecklist((prev) => ({ ...prev, [id]: checked }));
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

  // const renderTableBody = () =>
  //   dataKhoaPhong.map((item: any, i) => (
  //     <tr key={`department-${i + 1}`} style={{ backgroundColor: colors[i] }}>
  //       <td className="sticky-column">{item.TENGOIKHOAPHONG}</td>
  //       {Array.from({ length: CRITERIA_COUNT }, (_, j) => {
  //         const checkboxId = `tieuchi_${j + 1}_khoa_${item.MAKHOAPHONG}`;
  //         return (
  //           <td key={checkboxId}>
  //             <input
  //               type="checkbox"
  //               id={checkboxId}
  //               checked={checklist[checkboxId] || false}
  //               onChange={handleCheckboxChange}
  //             />
  //           </td>
  //         );
  //       })}
  //     </tr>
  //   ));

  const renderTableBody = () =>
    dataKhoaPhong.map((item: any, i) => (
      <tr key={`department-${i + 1}`} style={{ backgroundColor: colors[i] }}>
        <td className="sticky-column">{item.TENGOIKHOAPHONG}</td>
        {Array.from({ length: CRITERIA_COUNT }, (_, j) => {
          const criteriaNumber = j + 1;
          const checkboxId = `tieuchi_${criteriaNumber}_khoa_${item.MAKHOAPHONG}`;
          const isAvailable = availableCriteria.includes(criteriaNumber);

          return (
            <td key={checkboxId}>
              <input
                title={
                  !isAvailable
                    ? `Tiêu chí ${criteriaNumber} chưa được tạo. Vui lòng chọn tiêu chí khác`
                    : ''
                }
                type="checkbox"
                id={checkboxId}
                checked={checklist[checkboxId] || false}
                onChange={handleCheckboxChange}
                disabled={!isAvailable}
                style={{ opacity: isAvailable ? 1 : 0.5 }}
              />
            </td>
          );
        })}
      </tr>
    ));

  const handleSaveChecklist = async () => {
    try {
      let phanQuyen = [];

      for (const khoaPhong of dataKhoaPhong) {
        const danhSachTieuChi = Object.entries(checklist)
          .filter(
            ([key, value]) =>
              value &&
              key.includes(
                `khoa_${
                  (khoaPhong as unknown as { MAKHOAPHONG: string }).MAKHOAPHONG
                }`,
              ),
          )
          .map(([key]) => {
            const match = key.match(/tieuchi_(\d+)/);
            return match ? parseInt(match[1]) : null;
          })
          .filter((id) => id !== null)
          .sort((a, b) => a - b);

        if (danhSachTieuChi.length > 0) {
          phanQuyen.push({
            ten_khoa: (khoaPhong as unknown as { TENGOIKHOAPHONG: string })
              .TENGOIKHOAPHONG,
            danh_sach_tieu_chi: danhSachTieuChi,
          });
        }
      }

      if (phanQuyen.length > 0) {
        const requestData = { phan_quyen: phanQuyen };
        console.log(requestData);
        await PhanQuyenTieuChi(requestData);
      }

      localStorage.setItem('savedChecklist', JSON.stringify(checklist));
      setSavedChecklist(checklist);
      messageApi.success('Đã lưu checklist thành công');
    } catch (error) {
      messageApi.error('Có lỗi xảy ra khi lưu checklist');
    }
  };

  return (
    <>
      {contextHolder}
      {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container">
            <h1>Checklist Khoa Phòng</h1>
            {loadingTieuChiKhoaPhong === false ? (
              <>
                <button
                  onClick={handleSaveChecklist}
                  className="bg-primary mt-3 mb-3 p-3 text-white rounded-md"
                >
                  Lưu Checklist
                </button>

                <div className="table-container">
                  <table id="checklist-table">
                    <thead>{renderTableHeader()}</thead>
                    <tbody>{renderTableBody()}</tbody>
                  </table>
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
    </>
  );
};

export default ChecklistTable;
