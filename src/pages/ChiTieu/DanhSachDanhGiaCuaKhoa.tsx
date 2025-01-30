import {
  Table,
  Button,
  message,
  Input,
  Select,
  DatePicker,
  Result,
} from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
// import type { DatePickerProps } from 'antd';

// const { RangePicker } = DatePicker;
const { Option } = Select;

const DanhSachDanhGiaCuaKhoa = () => {
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  //   const [filterDate, setFilterDate] = useState<[string, string] | null>(null);
  const [danhSachKhoa, setDanhSachKhoa] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');

  const { khoaPhong } = useContext(UserContext);

  const navigate = useNavigate();

  const fetchDanhSachDanhGia = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://172.16.0.60:883/api/danh_gia_khoa',
      );
      const data = response.data.map((item: any) => ({
        ...item,
        key: item.id_danhgia,
      }));

      // Extract unique departments
      const uniqueKhoa = [...new Set(data.map((item: any) => item.ten_khoa))];
      setDanhSachKhoa(uniqueKhoa as string[]);
      setStatus('Fetch');
      setDanhSachDanhGia(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đánh giá');
    }
    setLoading(false);
  };

  const randomString = (length = 8) => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleToggleLock = async (record: any) => {
    try {
      //   await axios.put(
      //     `http://172.16.0.60:883/api/danh_gia_khoa/${record.id_danhgia}/lock`,
      //     {
      //       is_locked: !record.is_locked,
      //     },
      //   );
      //   await axios.put('http://172.16.0.60:883/api/cap_nhat_danhgia_tieu_muc', {
      //     id_danhgia: record.id_danhgia,
      //     id_danhgia_tieumuc: record.id_danhgia_tieumuc,
      //     khoa: record.khoa === 1 ? 0 : 1,
      //   });

      const evaluationData = record.danh_sach_danh_gia.flatMap((item: any) =>
        item.tieu_muc.map((tieuMuc: any) => ({
          id_danhgia_tieumuc: tieuMuc.id_danhgia_tieumuc,
          danh_gia: tieuMuc.danh_gia,
        })),
      );

      for (const data of evaluationData) {
        await axios.put(
          'http://172.16.0.60:883/api/cap_nhat_danhgia_tieu_muc',
          {
            id_danhgia_tieumuc: data.id_danhgia_tieumuc,
            danh_gia:
              data.danh_gia === 10 || data.danh_gia === 11
                ? data.danh_gia - 10
                : data.danh_gia + 10, // Set to locked
            // khoa: data.khoa === 1 ? 0 : 1,
          },
        );
        // console.log(data.id_danhgia_tieumuc);
      }

      setStatus(randomString());
      message.success('Cập nhật trạng thái thành công');
      //   fetchDanhSachDanhGia(); // Refresh data
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  //   const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
  //     setFilterDate(dateStrings);
  //   };

  const filteredData = danhSachDanhGia.filter((item: any) => {
    const searchFields = [
      item.ten_khoa,
      item.nhan_vien,
      new Date(item.ngay_gio_danh_gia).toLocaleString(), // Thêm ngày giờ đã format
    ]
      .join(' ')
      .toLowerCase();

    const matchSearch = searchFields.includes(searchText.toLowerCase());

    // const matchSearch = (
    //   item.ten_khoa +
    //   item.nhan_vien +
    //   item.ngay_gio_danh_gia
    // )
    //   .toLowerCase()
    //   .includes(searchText.toLowerCase());

    const matchKhoa = filterKhoa ? item.ten_khoa === filterKhoa : true;

    // const matchDate =
    //   filterDate && filterDate[0] && filterDate[1]
    //     ? new Date(item.ngay_gio_danh_gia) >= new Date(filterDate[0]) &&
    //       new Date(item.ngay_gio_danh_gia) <= new Date(filterDate[1])
    //     : true;

    return matchSearch && matchKhoa;
  });

  const isAllLocked = (record: any) => {
    return record.danh_sach_danh_gia.every((item: any) =>
      item.tieu_muc.every(
        (tieuMuc: any) => tieuMuc.danh_gia === 11 || tieuMuc.danh_gia === 10,
      ),
    );
  };

  const handleViewDetails = (record: any) => {
    navigate(`/chi-tiet-dot-danh-gia/${record._id}`);
  };

  const columns = [
    {
      title: 'Khoa/Phòng',
      dataIndex: 'ten_khoa',
      key: 'ten_khoa',
      sorter: (a: any, b: any) => a.ten_khoa.localeCompare(b.ten_khoa),
    },
    {
      title: 'Thời gian đánh giá',
      dataIndex: 'ngay_gio_danh_gia',
      key: 'ngay_gio_danh_gia',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: any, b: any) =>
        new Date(a.ngay_gio_danh_gia).getTime() -
        new Date(b.ngay_gio_danh_gia).getTime(),
    },
    {
      title: 'Người đánh giá',
      dataIndex: 'nhan_vien',
      key: 'nhan_vien',
      sorter: (a: any, b: any) => a.nhan_vien.localeCompare(b.nhan_vien),
    },
    {
      title: 'Trạng thái',
      key: 'action',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            danger={isAllLocked(record)}
            type={isAllLocked(record) ? 'default' : 'default'}
            icon={isAllLocked(record) ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleLock(record)}
          >
            {isAllLocked(record) ? 'Đã khóa' : 'Chưa khóa'}
          </Button>
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchDanhSachDanhGia();
  }, [status]);

  return (
    <>
      {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container">
            <h2 className="font-bold mb-4">Danh sách đợt đánh giá</h2>

            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Tìm kiếm"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />

              <Select
                placeholder="Lọc theo khoa"
                allowClear
                style={{ width: 200 }}
                onChange={(value) => setFilterKhoa(value)}
              >
                {danhSachKhoa.map((khoa) => (
                  <Option key={khoa} value={khoa}>
                    {khoa}
                  </Option>
                ))}
              </Select>

              {/* <RangePicker
          onChange={handleDateRangeChange}
          showTime
          format="DD/MM/YYYY HH:mm:ss"
        /> */}
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng số ${total} đợt đánh giá`,
                //   showSizeChanger: true,
                //   pageSizeOptions: ['10', '20', '50'],
              }}
            />
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

export default DanhSachDanhGiaCuaKhoa;
