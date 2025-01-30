import { useContext, useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
import { UserContext } from '../../context/UserContext';
import { Link, useParams } from 'react-router-dom';
import { DanhSachDanhGia } from '../../api/ChiTieuAPI';

const DetailsChiTieu: React.FC = () => {
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);
  const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
    DanhMuc[]
  >([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [evaluationScores, setEvaluationScores] = useState<
    Record<string, number>
  >({});

  const { khoaPhong } = useContext(UserContext);
  const { dotId } = useParams();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch evaluation data
        const evaluations = await DanhSachDanhGia();
        const selectedEvaluation = evaluations.find(
          (e: any) => e._id === dotId,
        );
        setEvaluationData(selectedEvaluation);

        // Khởi tạo evaluationScores từ dữ liệu đánh giá
        const scores: Record<string, number> = {};
        selectedEvaluation?.danh_sach_danh_gia?.forEach((tieuChi: any) => {
          tieuChi.tieu_muc.forEach((tieuMuc: any) => {
            scores[tieuMuc.id_tieumuc] = tieuMuc.danh_gia;
            if (tieuMuc.cac_tieu_muc_con) {
              tieuMuc.cac_tieu_muc_con.forEach((tmc: any) => {
                scores[tmc.id_tieumuccon] = tmc.danh_gia;
              });
            }
          });
        });
        setEvaluationScores(scores);

        // Fetch criteria list
        let data = await DanhSachPhanQuyenTieuChi();
        if (data) {
          let tieuchicuakhoa = data.find(
            (tieuchitheokhoa: any) =>
              tieuchitheokhoa.ten_khoa === selectedEvaluation?.ten_khoa,
          );

          if (
            tieuchicuakhoa &&
            Array.isArray(tieuchicuakhoa?.danh_sach_tieu_chi)
          ) {
            setDanhSachTieuChiTheoKhoa(tieuchicuakhoa.danh_sach_tieu_chi);
          }
        }
        setLoadingDanhMuc(false);
      } catch (error) {
        console.log(error);
        messageApi.error('Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu');
      }
    };

    if (dotId) {
      fetchData();
    }
  }, [dotId]);

  return (
    <>
      {contextHolder}
      {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container">
            {evaluationData && (
              <div className="mb-4">
                <h2 className="text-xl font-bold">Thông tin đợt đánh giá</h2>
                <p>Khoa/Phòng: {evaluationData.ten_khoa}</p>
                <p>Thời gian: {formatDate(evaluationData.ngay_gio_danh_gia)}</p>
                <p>Người đánh giá: {evaluationData.nhan_vien}</p>
              </div>
            )}

            <div id="form-container">
              <div id="levels-container">
                {loadingDanhMuc === false ? (
                  // Copy phần render criteria list từ DanhGiaTieuChiKhoaPhong
                  // Nhưng chỉ hiển thị, không cho phép chỉnh sửa
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
                                                      <div className="ml-2">
                                                        <span className="font-bold mr-2">
                                                          Đánh giá:
                                                        </span>
                                                        <span
                                                          className={`font-bold ${
                                                            evaluationScores[
                                                              item?.id_tieumuccon
                                                            ] === 1
                                                              ? 'text-success'
                                                              : 'text-danger'
                                                          }`}
                                                        >
                                                          {evaluationScores[
                                                            item?.id_tieumuccon
                                                          ] === 1
                                                            ? 'Đạt'
                                                            : 'Không đạt'}
                                                        </span>
                                                      </div>
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
                  <div className="text-center">
                    <LoadingOutlined style={{ fontSize: '50px' }} />
                  </div>
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

export default DetailsChiTieu;
