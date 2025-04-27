import { useEffect, useState, Fragment } from 'react';
// import './ChiTieuCap1.css';
import './DetailsChiTieu.css';
import { message, Result, Modal, List } from 'antd';
import {
  DownloadOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const [evaluationEvaluators, setEvaluationEvaluators] = useState<
    Record<string, string>
  >({});
  const [fileList, setFileList] = useState<Record<string, any[]>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTieuMucCon, setSelectedTieuMucCon] = useState<string>('');
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [tempNote, setTempNote] = useState<string>('');

  const { dotId } = useParams();
  const [status, setStatus] = useState<string>('');
  const [khoaPhong, setKhoaPhong] = useState('');
  const [evaluationDescriptions, setEvaluationDescriptions] = useState<
    Record<string, string>
  >({});

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

  useEffect(() => {
    if (dotId) {
      fetchFileList();
    }
  }, [dotId]);

  const fetchFileList = async () => {
    try {
      const response = await fetch('http://172.16.0.60:83/api/list_files');
      const data = await response.json();

      const filteredAndGroupedFiles = data
        .filter((file: any) => file.id_dot_danh_gia === dotId)
        .reduce((acc: any, file: any) => {
          if (!acc[file.id_tieumuccon]) {
            acc[file.id_tieumuccon] = [];
          }
          acc[file.id_tieumuccon].push(file);
          return acc;
        }, {});

      setFileList(filteredAndGroupedFiles);
    } catch (error) {
      messageApi.error('Lỗi khi tải danh sách file');
    }
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

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(
        `http://172.16.0.60:83/api/download_file/${fileId}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      messageApi.error('Lỗi khi tải file');
    }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const evaluations = await DanhSachDanhGia();
        const selectedEvaluation = evaluations.find(
          (e: any) => e._id === dotId,
        );

        if (!selectedEvaluation) {
          messageApi.error('Không tìm thấy dữ liệu đánh giá');
          return;
        }

        setEvaluationData(selectedEvaluation);

        const scores: Record<string, number> = {};
        const descriptions: Record<string, string> = {};
        const evaluators: Record<string, string> = {};

        selectedEvaluation?.danh_sach_danh_gia?.forEach((tieuChi: any) => {
          tieuChi.tieu_muc.forEach((tieuMuc: any) => {
            if (tieuMuc.ghichu_danhgia) {
              const danhGiaPairs = tieuMuc.ghichu_danhgia.split(',');
              danhGiaPairs.forEach((pair: string) => {
                const [id, score] = pair.split(':');
                if (id && score) {
                  scores[id] = parseInt(score);
                }
              });
            }

            if (tieuMuc.mota_danhgia) {
              const motaEntries = tieuMuc.mota_danhgia.split(',');
              motaEntries.forEach((entry: string) => {
                const [id, mota] = entry.split(':');
                if (id && mota && mota !== 'none') {
                  descriptions[id] = mota;
                }
              });
            }

            if (tieuMuc.nguoi_danhgia) {
              const evaluatorPairs = tieuMuc.nguoi_danhgia.split(',');
              evaluatorPairs.forEach((pair: string) => {
                const [id, name] = pair.split(':');
                if (id && name) {
                  evaluators[id] = name === 'none' ? '' : name || '';
                }
              });
            }
          });
        });

        setEvaluationScores(scores);
        setEvaluationDescriptions(descriptions);
        setEvaluationEvaluators(evaluators);

        let data = await DanhSachPhanQuyenTieuChi();
        if (data) {
          let tieuchicuakhoa = data
            .flatMap((item: any) =>
              item.phan_quyen.find(
                (phanquyen: any) =>
                  phanquyen.ten_khoa === selectedEvaluation?.ten_khoa,
              ),
            )
            .find(Boolean);

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
  }, [dotId, messageApi]);

  const showFileList = async (id_tieumuccon: string) => {
    setSelectedTieuMucCon(id_tieumuccon);
    setIsModalVisible(true);
  };

  const handleNoteClick = (id_tieumuccon: string) => {
    setSelectedTieuMucCon(id_tieumuccon);
    setTempNote(evaluationDescriptions[id_tieumuccon] || '');
    setIsNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    setEvaluationDescriptions((prev) => ({
      ...prev,
      [selectedTieuMucCon]: tempNote,
    }));
    setIsNoteModalVisible(false);
  };

  return (
    <>
      {contextHolder}
      {khoaPhong === 'Phòng Quản Lý chất lượng' ||
      khoaPhong === 'Phòng Công Nghệ Thông Tin' ? (
        <>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 details-chitieu">
            {evaluationData && (
              <div className="mb-4">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
                  Thông tin đợt đánh giá
                </h2>
                <p>Khoa/Phòng: {evaluationData.ten_khoa}</p>
                <p>
                  Thời gian:{' '}
                  {formatDate(evaluationData.nhan_vien.split('-')[1]?.trim())}
                </p>
              </div>
            )}

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
                        width: '65%',
                        wordWrap: 'break-word',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                      }}
                    >
                      Nội dung
                    </th>
                    <th
                      className="border p-3 text-center font-semibold bg-yellow-800"
                      style={{ width: '6%' }}
                    >
                      Mức
                    </th>
                    <th
                      className="border p-3 text-center font-semibold bg-green-800"
                      style={{ width: '6%' }}
                    >
                      Đạt
                    </th>
                    <th
                      className="border p-3 text-center font-semibold bg-red-800"
                      style={{
                        width: '6%',
                        wordWrap: 'break-word',
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        maxWidth: '0',
                      }}
                    >
                      Không đạt
                    </th>
                    <th
                      className="border p-2 text-center font-semibold bg-blue-800"
                      style={{ width: '17%' }}
                    >
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDanhMuc === false ? (
                    danhSachTieuChiTheoKhoa &&
                    Array.isArray(danhSachTieuChiTheoKhoa) &&
                    danhSachTieuChiTheoKhoa.length > 0 ? (
                      danhSachTieuChiTheoKhoa
                        .filter(
                          (tc) => tc.hidden === 0 || tc.hidden === undefined,
                        )
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
                                colSpan={5}
                              >
                                {tieuChi.ten_tieuchi}{' '}
                                {tieuChi.mo_ta ? ` - ${tieuChi.mo_ta}` : ''}
                              </td>
                            </tr>

                            {tieuChi.cac_tieu_muc &&
                              Array.isArray(tieuChi.cac_tieu_muc) &&
                              tieuChi.cac_tieu_muc
                                .filter(
                                  (tm) =>
                                    tm.hidden === 0 || tm.hidden === undefined,
                                )
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
                                          colSpan={5}
                                        >
                                          {tieuMuc.ten_tieu_muc}{' '}
                                          {tieuMuc.mo_ta_tieu_muc
                                            ? `- ${tieuMuc.mo_ta_tieu_muc}`
                                            : ''}
                                        </td>
                                      </tr>
                                    )}

                                    {tieuMuc.cac_tieu_muc_con &&
                                      Array.isArray(tieuMuc.cac_tieu_muc_con) &&
                                      tieuMuc.cac_tieu_muc_con
                                        .filter(
                                          (tmc) =>
                                            tmc.hidden === 0 ||
                                            tmc.hidden === undefined,
                                        )
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
                                            <td className="border p-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={
                                                  evaluationScores[
                                                    tieuMucCon.id_tieumuccon
                                                  ] === 1
                                                }
                                                disabled
                                                className="accent-green-500"
                                              />
                                            </td>
                                            <td className="border p-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={
                                                  evaluationScores[
                                                    tieuMucCon.id_tieumuccon
                                                  ] === 0
                                                }
                                                disabled
                                                className="accent-red-500"
                                              />
                                            </td>
                                            <td className="border p-2 text-center">
                                              <div className="flex justify-center space-x-1 sm:space-x-2">
                                                <button
                                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm sm:text-base transition-colors duration-200"
                                                  onClick={() =>
                                                    showFileList(
                                                      tieuMucCon.id_tieumuccon,
                                                    )
                                                  }
                                                  title="Xem file đính kèm"
                                                >
                                                  <EyeOutlined />
                                                </button>
                                                <button
                                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm sm:text-base transition-colors duration-200"
                                                  title="Xem ghi chú"
                                                  onClick={() =>
                                                    handleNoteClick(
                                                      tieuMucCon.id_tieumuccon,
                                                    )
                                                  }
                                                >
                                                  <CommentOutlined />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                  </Fragment>
                                ))}
                          </Fragment>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border p-4 text-center">
                          Không tìm thấy tiêu chí nào
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan={5} className="border p-4 text-center">
                        <div className="flex justify-center items-center">
                          <LoadingOutlined
                            style={{ fontSize: '24px' }}
                            className="mr-2"
                          />{' '}
                          Đang tải dữ liệu...
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
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
      )}

      <Modal
        title={`Danh sách file đã tải lên`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTieuMucCon && (
          <>
            {fileList[selectedTieuMucCon]?.length > 0 ? (
              <List
                dataSource={fileList[selectedTieuMucCon]}
                renderItem={(item) => (
                  <List.Item
                    key={item.file_id}
                    actions={[
                      <span
                        title="Tải file về"
                        onClick={() =>
                          handleDownload(item.file_id, item.filename)
                        }
                        className="text-primary hover:text-primary-dark cursor-pointer"
                      >
                        <DownloadOutlined />
                      </span>,
                    ]}
                  >
                    <div>{item.filename}</div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center">Không có file nào được tải lên</div>
            )}
          </>
        )}
      </Modal>

      <Modal
        title="Ghi chú đánh giá"
        open={isNoteModalVisible}
        onCancel={() => setIsNoteModalVisible(false)}
        footer={[
          <button
            key="close"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => setIsNoteModalVisible(false)}
          >
            Đóng
          </button>,
        ]}
        width={600}
      >
        <div className="p-4 bg-gray-50 rounded">
          <p className="whitespace-pre-wrap">
            {tempNote || 'Không có ghi chú'}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default DetailsChiTieu;
