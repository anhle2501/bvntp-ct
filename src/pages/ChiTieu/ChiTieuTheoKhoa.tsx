import { useContext, useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const ChiTieuTheoKhoa: React.FC = () => {
  // const [level1Count] = useState<number>(83);

  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

  const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
    DanhMuc[]
  >([]);

  const [messageApi, contextHolder] = message.useMessage();

  const { khoaPhong } = useContext(UserContext);

  useEffect(() => {
    const fetchDataTieuChiTheoKhoa = async () => {
      try {
        let data = await DanhSachPhanQuyenTieuChi();

        if (data) {
          let tieuchicuakhoa = data.find(
            (tieuchitheokhoa: any) => tieuchitheokhoa.ten_khoa === khoaPhong,
          );

          if (
            tieuchicuakhoa &&
            Array.isArray(tieuchicuakhoa?.danh_sach_tieu_chi)
          ) {
            console.log(tieuchicuakhoa.danh_sach_tieu_chi);

            setDanhSachTieuChiTheoKhoa(tieuchicuakhoa.danh_sach_tieu_chi);

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
      }
    };
    if (khoaPhong) {
      // Chỉ fetch khi đã có khoaPhong
      fetchDataTieuChiTheoKhoa();
    }
  }, [khoaPhong]);

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
          <div className="container">
            <h1 className="font-bold mb-4">Danh mục của {khoaPhong}</h1>
            <div id="form-container">
              <div id="levels-container">
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
                              <h3 className="text-danger font-bold">
                                Tiêu chí - {level1Id}
                              </h3>

                              <div className="input-group">
                                <input
                                  type="text"
                                  placeholder="Số"
                                  value={level1Id}
                                  readOnly
                                  style={{ width: '8%' }}
                                />

                                <input
                                  type="text"
                                  placeholder="Tên Tiêu chí"
                                  id={`ten-tieuchi-cap1-${level1Id}`}
                                  defaultValue={existingData?.ten_tieuchi || ''}
                                  style={{ width: '10%' }}
                                  readOnly
                                />
                                <textarea
                                  id={`noidung-tieuchi-cap1-${level1Id}`}
                                  className=""
                                  defaultValue={existingData?.mo_ta || ''}
                                  rows={2}
                                  style={{
                                    width: '70%',
                                    // resize: 'none',
                                    overflow: 'hidden',
                                    verticalAlign: 'middle',
                                    padding: '0 10px',
                                    lineHeight: '2.8',
                                    border: '1px solid #ced4da',
                                    borderRadius: '0.25rem',
                                  }}
                                  placeholder="Nội dung Tiêu chí"
                                  readOnly
                                ></textarea>
                              </div>

                              {existingData?.cac_tieu_muc &&
                                Array.isArray(existingData?.cac_tieu_muc) &&
                                existingData?.cac_tieu_muc
                                  .filter((item) => item.hidden === 0)
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

                                          <div className="input-group">
                                            <input
                                              type="text"
                                              placeholder="Số"
                                              value={`${item?.so_tieu_muc}`}
                                              readOnly
                                              style={{ width: '8%' }}
                                            />
                                            <input
                                              type="text"
                                              placeholder="Tên Tiểu mục"
                                              defaultValue={
                                                item?.ten_tieu_muc || ''
                                              }
                                              id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
                                              style={{ width: '10%' }}
                                              readOnly
                                            />

                                            <textarea
                                              id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
                                              className=""
                                              defaultValue={
                                                item?.mo_ta_tieu_muc || ''
                                              }
                                              rows={2}
                                              style={{
                                                width: '70%',
                                                // resize: 'none',
                                                overflow: 'hidden',
                                                verticalAlign: 'middle',
                                                padding: '0 10px',
                                                lineHeight: '2.8',
                                                border: '1px solid #ced4da',
                                                borderRadius: '0.25rem',
                                              }}
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
                                                      {item?.so_tieu_muc_con}
                                                    </h3>

                                                    <div
                                                      className="input-group"
                                                      key={
                                                        item?.so_tieu_muc_con
                                                      }
                                                    >
                                                      <input
                                                        type="text"
                                                        placeholder="Số"
                                                        value={`${item?.so_tieu_muc_con}`}
                                                        readOnly
                                                        style={{ width: '8%' }}
                                                      />
                                                      <input
                                                        type="text"
                                                        placeholder="Tên Tiểu mục con"
                                                        id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                        style={{ width: '10%' }}
                                                        defaultValue={
                                                          item?.ten_tieu_muc_con
                                                            ? item?.ten_tieu_muc_con
                                                            : ''
                                                        }
                                                        readOnly
                                                      />
                                                      <input
                                                        className="mr-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                        type="number"
                                                        min={1}
                                                        placeholder="Mức"
                                                        id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                        style={{ width: '10%' }}
                                                        defaultValue={
                                                          item?.muc
                                                            ? item?.muc
                                                            : ''
                                                        }
                                                        onInput={(e: any) => {
                                                          if (
                                                            e.target.value <= 1
                                                          )
                                                            e.target.value = 1;
                                                        }}
                                                        readOnly
                                                      />
                                                      <textarea
                                                        id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                        className=""
                                                        defaultValue={
                                                          item?.mo_ta_tieu_muc_con
                                                            ? item?.mo_ta_tieu_muc_con
                                                            : ''
                                                        }
                                                        rows={2}
                                                        style={{
                                                          width: '55%',
                                                          // resize: 'none',
                                                          overflow: 'hidden',
                                                          verticalAlign:
                                                            'middle',
                                                          padding: '10px 10px',
                                                          lineHeight: '1.5',
                                                          border:
                                                            '1px solid #ced4da',
                                                          borderRadius:
                                                            '0.25rem',
                                                        }}
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
                    <div className="text-center">
                      <LoadingOutlined style={{ fontSize: '50px' }} />
                    </div>
                  </>
                )}
              </div>
            </div>
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
