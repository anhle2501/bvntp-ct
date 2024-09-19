import React, { useState, useEffect } from 'react';
import './ChecklistTable.css'; // Giả sử bạn có file CSS riêng
import { DanhSachKhoaPhong } from '../../api/TieuChiKhoaPhongAPI';
import { message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const DEPARTMENT_COUNT = 55;
const CRITERIA_COUNT = 83;

interface ChecklistState {
  [key: string]: boolean;
}

const ChecklistTable: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [dataKhoaPhong, setDataKhoaPhong] = useState<string[]>([]);
  const [loadingTieuChiKhoaPhong, setLoadingTieuChiKhoaPhong] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setColors(generateColors(DEPARTMENT_COUNT));
  }, []);

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

  const renderTableBody = () =>
    dataKhoaPhong.map((item: any, i) => (
      <tr key={`department-${i + 1}`} style={{ backgroundColor: colors[i] }}>
        <td className="sticky-column">{item.TENGOIKHOAPHONG}</td>
        {Array.from({ length: CRITERIA_COUNT }, (_, j) => {
          const checkboxId = `tieuchi_${j + 1}_khoa_${i + 1}`;
          return (
            <td key={checkboxId}>
              <input
                type="checkbox"
                id={checkboxId}
                checked={checklist[checkboxId] || false}
                onChange={handleCheckboxChange}
              />
            </td>
          );
        })}
      </tr>
    ));

  return (
    <>
      {contextHolder}

      <div>
        <h1>Checklist Khoa Phòng</h1>
        {loadingTieuChiKhoaPhong === false ? (
          <>
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
  );
};

export default ChecklistTable;
