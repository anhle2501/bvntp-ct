import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Button, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

interface LogDanhGia {
  hanh_dong: string;
  id_danh_gia: string;
  id_tieuchi: string;
  id_tieumuc: string;
  nguoi_thuc_hien: string;
  ten_khoa: string;
  ten_tieuchi: string;
  ten_tieumuc: string;
  thoi_gian: string;
}

interface TableData {
  key: number;
  stt: number;
  noi_dung: string;
  thoi_gian: string; // Giữ lại để sắp xếp
}

const LichSuThaoTac: React.FC = () => {
  const [logs, setLogs] = useState<LogDanhGia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<TableData[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const formatNoiDung = (log: LogDanhGia): string => {
    let hanhDongText = '';
    switch (log.hanh_dong) {
      case 'danh_gia':
        hanhDongText = 'đã đánh giá';
        break;
      default:
        hanhDongText = log.hanh_dong;
    }

    const formattedTime = dayjs(log.thoi_gian).format('HH:mm:ss DD/MM/YYYY');

    return `${log.nguoi_thuc_hien} của ${log.ten_khoa} ${hanhDongText} tiểu mục "${log.ten_tieumuc}" của tiêu chí "${log.ten_tieuchi}" lúc ${formattedTime}`;
  };

  const transformLogsToTableData = (logs: LogDanhGia[]): TableData[] => {
    return logs.map((log, index) => ({
      key: index,
      stt: index + 1,
      noi_dung: formatNoiDung(log),
      thoi_gian: log.thoi_gian, // Giữ lại để sắp xếp
    }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://172.16.0.60:83/api/log_danh_gia');
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu lịch sử thao tác');
      }
      const data = await response.json();

      // Sắp xếp dữ liệu theo thời gian từ mới nhất đến cũ nhất
      const sortedData = [...data].sort(
        (a, b) => dayjs(b.thoi_gian).unix() - dayjs(a.thoi_gian).unix(),
      );

      setLogs(sortedData);
      setFilteredLogs(transformLogsToTableData(sortedData));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      messageApi.error('Không thể lấy dữ liệu lịch sử thao tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = () => {
    let filtered = [...logs];

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.nguoi_thuc_hien.toLowerCase().includes(searchLower) ||
          log.ten_khoa.toLowerCase().includes(searchLower) ||
          log.ten_tieuchi.toLowerCase().includes(searchLower) ||
          log.ten_tieumuc.toLowerCase().includes(searchLower),
      );
    }

    // Lọc theo khoảng thời gian
    if (startDate && endDate) {
      filtered = filtered.filter((log) => {
        const logDate = dayjs(log.thoi_gian);
        return (
          logDate.isAfter(startDate) && logDate.isBefore(endDate.add(1, 'day'))
        );
      });
    }

    setFilteredLogs(transformLogsToTableData(filtered));
  };

  const handleReset = () => {
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setFilteredLogs(transformLogsToTableData(logs));
  };

  const columns: ColumnsType<TableData> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 70,
      align: 'center',
    },
    {
      title: 'Nội dung',
      dataIndex: 'noi_dung',
      key: 'noi_dung',
      sorter: (a, b) => dayjs(a.thoi_gian).unix() - dayjs(b.thoi_gian).unix(),
      defaultSortOrder: 'descend',
      align: 'center',
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      {contextHolder}
      <h2 className="text-2xl font-semibold mb-6">Lịch sử thao tác đánh giá</h2>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Tìm kiếm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
          type="text"
        />

        <div className="flex gap-2">
          <DatePicker
            locale={locale}
            placeholder="Từ ngày"
            value={startDate}
            onChange={setStartDate}
            format="DD/MM/YYYY"
          />
          <DatePicker
            locale={locale}
            placeholder="Đến ngày"
            value={endDate}
            onChange={setEndDate}
            format="DD/MM/YYYY"
          />
        </div>
        <div className="flex gap-2">
          <Button type="primary" className="bg-primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Đặt lại
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredLogs}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
};

export default LichSuThaoTac;
