import { Table, Button, message, Select, Result } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { ColumnType } from 'antd/es/table';

const { Option } = Select;

// Định nghĩa interface cho data
interface DataType {
  ten_khoa: string;
  ngay_gio_danh_gia: string;
  nhan_vien: string;
  _id: string;
  danh_sach_danh_gia: any[];
}

const DanhSachDanhGiaCuaKhoa = () => {
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [danhSachKhoa, setDanhSachKhoa] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const [khoaPhong, setKhoaPhong] = useState('');

  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

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
      const evaluationData = record.danh_sach_danh_gia.flatMap((item: any) =>
        item.tieu_muc.map((tieuMuc: any) => ({
          id_danh_gia: record._id,
          id_tieuchi: item.id_tieuchi, // Add this from the parent item
          id_tieumuc: tieuMuc.id_tieumuc,
          danh_gia:
            tieuMuc.danh_gia === 10 || tieuMuc.danh_gia === 11
              ? tieuMuc.danh_gia - 10
              : tieuMuc.danh_gia + 10,
          ghichu_danhgia: tieuMuc.ghichu_danhgia || '',
          mota_danhgia: tieuMuc.mota_danhgia || '',
        })),
      );

      for (const data of evaluationData) {
        await axios.put(
          'http://172.16.0.60:883/api/cap_nhat_danh_gia_tieu_muc',
          data,
        );
      }

      setStatus(randomString());
      message.success('Cập nhật trạng thái thành công');
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  // const filteredData = danhSachDanhGia.filter((item: any) => {
  //   const searchFields = [
  //     item.ten_khoa,
  //     item.nhan_vien,
  //     new Date(item.ngay_gio_danh_gia).toLocaleString(), // Thêm ngày giờ đã format
  //   ]
  //     .join(' ')
  //     .toLowerCase();

  //   const matchSearch = searchFields.includes(searchText.toLowerCase());

  //   const matchKhoa = filterKhoa ? item.ten_khoa === filterKhoa : true;

  //   return matchSearch && matchKhoa;
  // });

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

  const filteredData = danhSachDanhGia.filter((item: any) => {
    // Lấy ngày giờ đã format giống như cách hiển thị trong bảng
    let formattedDate = '';
    if (item.nhan_vien && item.nhan_vien.includes('-')) {
      formattedDate = formatDate(item.nhan_vien.split('-')[1]);
    }

    const searchFields = [
      item.ten_khoa,
      item.nhan_vien,
      formattedDate, // Sử dụng định dạng ngày giờ giống như hiển thị
    ]
      .join(' ')
      .toLowerCase();

    // Sử dụng indexOf thay vì includes để tìm kiếm chính xác hơn
    const matchSearch =
      searchText === '' ||
      searchFields.indexOf(searchText.toLowerCase()) !== -1;

    const matchKhoa = filterKhoa ? item.ten_khoa === filterKhoa : true;

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

  const columns: ColumnType<DataType>[] = [
    {
      title: 'Khoa/Phòng',
      dataIndex: 'ten_khoa',
      key: 'ten_khoa',

      sorter: (a: any, b: any) => a.ten_khoa.localeCompare(b.ten_khoa),
    },
    {
      title: 'Thời gian đánh giá',
      dataIndex: 'nhan_vien',
      key: 'ngay_gio_danh_gia',

      // render: (text: string) => new Date(text).toLocaleString(),
      // sorter: (a: any, b: any) =>
      //   new Date(a.ngay_gio_danh_gia).getTime() -
      //   new Date(b.ngay_gio_danh_gia).getTime(),

      render: (text: string) => {
        if (text.includes('-')) {
          return formatDate(text.split('-')[1]);
        }
        return '';
      },
      sorter: (a: any, b: any) => {
        const dateA = a.nhan_vien.split('-')[1] || '';
        const dateB = b.nhan_vien.split('-')[1] || '';
        return dateA.localeCompare(dateB);
      },
    },
    // {
    //   title: 'Người đánh giá',
    //   dataIndex: 'nhan_vien',
    //   key: 'nhan_vien',
    //   render: (text: string) => {
    //     if (text.includes('-')) {
    //       return text.split('-')[0];
    //     }
    //     return text;
    //   },
    //   sorter: (a: any, b: any) => a.nhan_vien.localeCompare(b.nhan_vien),
    // },
    {
      title: 'Trạng thái',
      key: 'action',
      render: (_: any, record: any) => (
        // <div className="flex gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
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
            className="w-full sm:w-auto"
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-bold mb-4 text-xl sm:text-2xl">
              Danh sách đợt đánh giá
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                className="w-full"
                type="text"
                placeholder="Tìm kiếm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Lọc theo khoa"
                allowClear
                className="w-full sm:w-[200px]"
                onChange={(value) => setFilterKhoa(value)}
              >
                {danhSachKhoa.map((khoa) => (
                  <Option key={khoa} value={khoa}>
                    {khoa}
                  </Option>
                ))}
              </Select>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              scroll={{ x: 'max-content' }}
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
