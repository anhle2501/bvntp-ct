import { useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

const ChiTieuTheoKhoa: React.FC = () => {
  // const [level1Count] = useState<number>(83);

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
      const response = await axios.get('http://172.16.0.60:883/api/phan_quyen');
      if (response.data) {
        // Filter and transform the data
        const dotTheoKhoa = response.data
          .filter((item: any) => {
            // Find if any phan_quyen entry matches the khoaPhong
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
  }, [khoaPhong, status]);

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
    // Bắt buộc tạo giá trị state mới ngay cả khi chọn cùng một option
    setLoadingDanhMuc(true);

    // Xóa lựa chọn trước để buộc re-render
    setSelectedDot('');

    // Sử dụng setTimeout để đảm bảo cập nhật state xảy ra trong chu kỳ render riêng biệt
    setTimeout(() => {
      setSelectedDot(selectedOption ? selectedOption.value : '');
    }, 0);
  };

  // Modify the fetchDataTieuChiTheoKhoa function to use the selected dot
  const fetchDataTieuChiTheoKhoa = async () => {
    try {
      let data = await DanhSachPhanQuyenTieuChi();

      if (data && Array.isArray(data)) {
        // If a dot is selected, find that specific record
        let targetPhanQuyen;

        if (selectedDot) {
          // Find the record that matches the selected dot's timestamp
          targetPhanQuyen = data.find(
            (record) => formatDate(record.thoi_gian_ghi_nhan) === selectedDot,
          )?.phan_quyen;
        } else {
          // If no dot is selected, use the latest record (first item)
          targetPhanQuyen = data[0]?.phan_quyen;
        }

        // Find the khoa's data in the selected/latest phan_quyen
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
      // Chỉ fetch khi đã có khoaPhong
      fetchDataTieuChiTheoKhoa();
    }
  }, [khoaPhong, selectedDot]); // Add selectedDot as a dependency

  const tx = document.getElementsByTagName('textarea');
  for (let i = 0; i < tx.length; i++) {
    tx[i].style.height = tx[i].scrollHeight + 'px';
    tx[i].style.overflowY = 'hidden';
    tx[i].addEventListener('input', OnInput, false);
  }

  function OnInput(this: HTMLTextAreaElement) {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  return (
    <>
      {contextHolder}
      {khoaPhong !== 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Danh mục của {khoaPhong}
            </h1>
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
                onChange={handleDotChange} // Add the handler here
                className="w-full sm:w-1/2"
              />
            </div>
            {selectedDot && (
              <>
                <div id="form-container">
                  <div id="levels-container" className="space-y-6">
                    {loadingDanhMuc === false ? (
                      <>
                        {danhSachTieuChiTheoKhoa &&
                        Array.isArray(danhSachTieuChiTheoKhoa) &&
                        danhSachTieuChiTheoKhoa.length > 0 ? (
                          danhSachTieuChiTheoKhoa
                            .filter((tc) => tc.hidden === 0)
                            .map((existingData) => {
                              const level1Id = existingData.so_tieuchi;

                              return (
                                <div
                                  key={`level-1-${level1Id}`}
                                  className="level"
                                  id={`level-1-${level1Id}`}
                                >
                                  <h3 className="text-red-600 font-bold text-lg md:text-xl mb-4">
                                    Tiêu chí - {level1Id}
                                  </h3>

                                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <input
                                      type="text"
                                      placeholder="Số"
                                      value={level1Id}
                                      readOnly
                                      className="h-10 w-full md:w-[8%] p-2 border rounded"
                                    />

                                    <input
                                      type="text"
                                      placeholder="Tên Tiêu chí"
                                      id={`ten-tieuchi-cap1-${level1Id}`}
                                      defaultValue={
                                        existingData?.ten_tieuchi || ''
                                      }
                                      className="h-10 w-full md:w-[20%] p-2 border rounded"
                                      readOnly
                                    />
                                    <textarea
                                      id={`noidung-tieuchi-cap1-${level1Id}`}
                                      defaultValue={existingData?.mo_ta || ''}
                                      rows={2}
                                      className="w-full md:w-[72%] p-2 border rounded min-h-[60px] resize-y"
                                      // style={{
                                      //   width: '70%',
                                      //   // resize: 'none',
                                      //   overflow: 'hidden',
                                      //   verticalAlign: 'middle',
                                      //   padding: '0 10px',
                                      //   lineHeight: '2.8',
                                      //   border: '1px solid #ced4da',
                                      //   borderRadius: '0.25rem',
                                      // }}
                                      placeholder="Nội dung Tiêu chí"
                                      readOnly
                                    ></textarea>
                                  </div>

                                  {existingData?.cac_tieu_muc &&
                                    Array.isArray(existingData?.cac_tieu_muc) &&
                                    existingData?.cac_tieu_muc
                                      // .filter((item) => item.hidden === 0)
                                      .filter((item) => {
                                        // Only show tiểu mục that are not hidden AND have at least one visible tiểu mục con
                                        return (
                                          item.hidden === 0 &&
                                          Array.isArray(
                                            item.cac_tieu_muc_con,
                                          ) &&
                                          item.cac_tieu_muc_con.filter(
                                            (subItem) => subItem.hidden === 0,
                                          ).length > 0
                                        );
                                      })
                                      .map((item, level2Index) => {
                                        const level2Id = level2Index + 1;

                                        const existingDataTieuMuc =
                                          existingData?.cac_tieu_muc.find(
                                            (tc) =>
                                              tc.so_tieu_muc ===
                                                item?.so_tieu_muc &&
                                              tc.hidden === 0,
                                          );

                                        return (
                                          <>
                                            <div
                                              key={`${level1Id}-${level2Id}`}
                                              className="level"
                                              id={`level-2-${level1Id}-${level2Id}`}
                                            >
                                              <h3 className="text-primary font-bold">
                                                Tiểu mục - {item?.so_tieu_muc}
                                              </h3>

                                              {/* <div className="input-group"> */}
                                              <div className="flex flex-col md:flex-row gap-4 mb-4">
                                                <input
                                                  type="text"
                                                  placeholder="Số"
                                                  value={`${item?.so_tieu_muc}`}
                                                  readOnly
                                                  className="h-10 w-full md:w-[8%] p-2 border rounded"
                                                />
                                                <input
                                                  type="text"
                                                  placeholder="Tên Tiểu mục"
                                                  defaultValue={
                                                    item?.ten_tieu_muc || ''
                                                  }
                                                  className="h-10 w-full md:w-[20%] p-2 border rounded"
                                                  id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
                                                  readOnly
                                                />

                                                <textarea
                                                  id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
                                                  className="w-full md:w-[72%] p-2 border rounded min-h-[60px] resize-y"
                                                  defaultValue={
                                                    item?.mo_ta_tieu_muc || ''
                                                  }
                                                  rows={2}
                                                  // style={{
                                                  //   width: '70%',
                                                  //   // resize: 'none',
                                                  //   overflow: 'hidden',
                                                  //   verticalAlign: 'middle',
                                                  //   padding: '0 10px',
                                                  //   lineHeight: '2.8',
                                                  //   border: '1px solid #ced4da',
                                                  //   borderRadius: '0.25rem',
                                                  // }}
                                                  placeholder="Nội dung Tiểu mục"
                                                  readOnly
                                                ></textarea>
                                              </div>

                                              {existingDataTieuMuc?.cac_tieu_muc_con &&
                                                Array.isArray(
                                                  existingDataTieuMuc?.cac_tieu_muc_con,
                                                ) &&
                                                existingDataTieuMuc?.cac_tieu_muc_con
                                                  .filter(
                                                    (item) => item.hidden === 0,
                                                  )
                                                  .map((item, level3Index) => {
                                                    const level3Id =
                                                      level3Index + 1;

                                                    return (
                                                      <div
                                                        key={`${level1Id}-${level2Id}-${level3Id}`}
                                                        data-so-tieu-muc-con={
                                                          item?.so_tieu_muc_con
                                                        }
                                                        className="level"
                                                        id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
                                                      >
                                                        <h3 className="text-success font-bold">
                                                          Tiểu mục con -{' '}
                                                          {
                                                            item?.so_tieu_muc_con
                                                          }
                                                        </h3>

                                                        <div
                                                          // className="input-group"
                                                          className="flex flex-col md:flex-row gap-4"
                                                          key={
                                                            item?.so_tieu_muc_con
                                                          }
                                                        >
                                                          <input
                                                            type="text"
                                                            placeholder="Số"
                                                            value={`${item?.so_tieu_muc_con}`}
                                                            readOnly
                                                            className="h-10 w-full md:w-[8%] p-2 border rounded"
                                                          />
                                                          <input
                                                            type="text"
                                                            placeholder="Tên Tiểu mục con"
                                                            id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                            defaultValue={
                                                              item?.ten_tieu_muc_con
                                                                ? item?.ten_tieu_muc_con
                                                                : ''
                                                            }
                                                            readOnly
                                                            className="h-10 w-full md:w-[20%] p-2 border rounded"
                                                          />
                                                          <input
                                                            type="number"
                                                            min={1}
                                                            placeholder="Mức"
                                                            id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                            defaultValue={
                                                              item?.muc
                                                                ? item?.muc
                                                                : ''
                                                            }
                                                            onInput={(
                                                              e: any,
                                                            ) => {
                                                              if (
                                                                e.target
                                                                  .value <= 1
                                                              )
                                                                e.target.value = 1;
                                                            }}
                                                            readOnly
                                                            className="h-10 w-full md:w-[10%] p-2 border rounded"
                                                          />
                                                          <textarea
                                                            id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                            defaultValue={
                                                              item?.mo_ta_tieu_muc_con
                                                                ? item?.mo_ta_tieu_muc_con
                                                                : ''
                                                            }
                                                            className="w-full md:w-[62%] p-2 border rounded min-h-[60px] resize-y"
                                                            rows={2}
                                                            // style={{
                                                            //   width: '55%',
                                                            //   // resize: 'none',
                                                            //   overflow: 'hidden',
                                                            //   verticalAlign:
                                                            //     'middle',
                                                            //   padding: '10px 10px',
                                                            //   lineHeight: '1.5',
                                                            //   border:
                                                            //     '1px solid #ced4da',
                                                            //   borderRadius:
                                                            //     '0.25rem',
                                                            // }}
                                                            placeholder="Nội dung Tiểu mục con"
                                                            readOnly
                                                          ></textarea>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                            </div>
                                          </>
                                        );
                                      })}
                                </div>
                              );
                            })
                        ) : (
                          <>
                            {' '}
                            <div className="text-center text-lg font-medium">
                              Không tìm thấy tiêu chí nào
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <LoadingOutlined className="text-4xl" />
                        </div>
                      </>
                    )}
                  </div>
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
              <Link to={'/quan-ly-tieu-chi'}>
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

export default ChiTieuTheoKhoa;
