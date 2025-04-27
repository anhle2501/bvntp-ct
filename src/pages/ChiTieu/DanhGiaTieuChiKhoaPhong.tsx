import { useEffect, useState, Fragment } from 'react';
import './ChiTieuCap1.css';
import { List, message, Modal, Result } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
  EditOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import Select from 'react-select';
import axios from 'axios';
import { DanhSachDanhGia } from '../../api/ChiTieuAPI';
import { Link, useNavigate } from 'react-router-dom';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';

interface StoredFile {
  fileId: string;
  fileName: string;
  id_tieumuccon: string;
}

interface FilesByTieuMucCon {
  [key: string]: StoredFile[];
}

const DanhGiaTieuChiKhoaPhong: React.FC = () => {
  const [storedFiles, setStoredFiles] = useState<FilesByTieuMucCon>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTieuMucCon, setSelectedTieuMucCon] = useState<string>('');
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [tempNote, setTempNote] = useState<string>('');

  const [selectedDot, setSelectedDot] = useState<string>('');
  const [evaluationScores, setEvaluationScores] = useState<
    Record<string, number>
  >({});
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

  const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
    DanhMuc[]
  >([]);

  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

  const [khoaPhong, setKhoaPhong] = useState('');
  const [tenNhanVien, setTenNhanVien] = useState('');

  const [messageApi, contextHolder] = message.useMessage();

  const [danhSachDot, setDanhSachDot] = useState<any[]>([]);

  const [status, setStatus] = useState<string>('');

  const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);

  const [filesByTieuMucCon, setFilesByTieuMucCon] = useState<
    Record<string, File>
  >({});

  const [evaluationExists, setEvaluationExists] = useState(false);

  const [apiTimestamp, setApiTimestamp] = useState('');

  const [evaluationNotes, setEvaluationNotes] = useState<
    Record<string, string>
  >({});

  const [evaluatorNames, setEvaluatorNames] = useState<Record<string, string>>(
    {},
  );

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

  const handleEvaluatorNameChange = (id_tieumuccon: string, value: string) => {
    setEvaluatorNames((prev) => ({
      ...prev,
      [id_tieumuccon]: value,
    }));
  };

  const getFileCounts = async () => {
    try {
      setFileCounts({});

      if (!selectedDot || !khoaPhong) {
        return;
      }

      const [filesResponse, phanQuyenResponse, danhGiaResponse] =
        await Promise.all([
          axios.get('http://172.16.0.60:83/api/list_files'),
          axios.get('http://172.16.0.60:83/api/phan_quyen'),
          axios.get('http://172.16.0.60:83/api/danh_gia_khoa'),
        ]);

      const selectedPhanQuyen = phanQuyenResponse.data.find(
        (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === selectedDot,
      );

      if (!selectedPhanQuyen) {
        console.log('Không tìm thấy đợt phân quyền');
        return;
      }

      const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
        const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
        return (
          formatDate(timestamp) === selectedDot &&
          danhGia.ten_khoa === khoaPhong
        );
      });

      if (!selectedEvaluation) {
        console.log('Không tìm thấy đánh giá cho đợt này và khoa phòng này');
        return;
      }

      const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
        (pq: any) => pq.ten_khoa === khoaPhong,
      );

      if (!khoaPhongData) {
        console.log('Không tìm thấy dữ liệu khoa phòng');
        return;
      }

      const validTieuMucConIds: string[] = [];
      khoaPhongData.danh_sach_tieu_chi.forEach((tieuChi: any) => {
        tieuChi.cac_tieu_muc.forEach((tieuMuc: any) => {
          tieuMuc.cac_tieu_muc_con?.forEach((tieuMucCon: any) => {
            validTieuMucConIds.push(tieuMucCon.id_tieumuccon);
          });
        });
      });

      const counts: Record<string, number> = {};

      if (
        filesResponse.data &&
        Array.isArray(filesResponse.data) &&
        filesResponse.data.length > 0
      ) {
        filesResponse.data.forEach((file: any) => {
          const fileDate = file.id_dot_danh_gia;
          const isSameDate = fileDate === selectedEvaluation._id;

          if (validTieuMucConIds.includes(file.id_tieumuccon) && isSameDate) {
            counts[file.id_tieumuccon] = (counts[file.id_tieumuccon] || 0) + 1;
          }
        });
      }

      setFileCounts(counts);

      localStorage.setItem('fileCounts', JSON.stringify(counts));
    } catch (error) {
      console.error('Lỗi khi lấy số lượng file:', error);
      setFileCounts({});
    }
  };

  useEffect(() => {
    if (selectedDot && khoaPhong) {
      getFileCounts();
    } else {
      setFileCounts({});
    }
  }, [selectedDot, khoaPhong, status]);

  useEffect(() => {
    if (khoaPhong) {
      fetchDataTieuChiTheoKhoa();
    }
  }, [khoaPhong]);

  const checkExistingEvaluation = async () => {
    try {
      const response = await axios.get(
        'http://172.16.0.60:83/api/danh_gia_khoa',
      );
      const evaluations = response.data;

      const exists = evaluations.some((evaluation: any) => {
        const timestamp = evaluation.nhan_vien.split('-')[1]?.trim();

        return (
          evaluation.ten_khoa === khoaPhong &&
          formatDate(timestamp) === selectedDot
        );
      });

      setEvaluationExists(exists);
    } catch (error) {
      console.error(error);
      messageApi.error('Lỗi kiểm tra đánh giá');
    }
  };
  useEffect(() => {
    if (khoaPhong && selectedDot) {
      checkExistingEvaluation();
    }
  }, [khoaPhong, selectedDot]);

  const fetchDataTieuChiTheoKhoa = async () => {
    try {
      let response = await fetch('http://172.16.0.60:83/api/phan_quyen');
      let data = await response.json();

      if (data && Array.isArray(data)) {
        setApiTimestamp(data[0]?.thoi_gian_ghi_nhan);
        const latestPhanQuyen = data[0]?.phan_quyen;

        const khoaData = latestPhanQuyen?.find(
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
    try {
      const kiemTraDaDangNhapHayChua = async () => {
        let token = localStorage.getItem('token');
        if (!token) {
          navigate('/dang-nhap');
        }

        let decodeDangNhap: any = await handleDecodeDangNhap(token);
        setKhoaPhong(decodeDangNhap?.khoaphong);
        setTenNhanVien(decodeDangNhap?.tennhanvien);
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

  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setFilesByTieuMucCon(JSON.parse(savedFiles));
    }
  }, []);

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
      const response = await axios.get('http://172.16.0.60:83/api/phan_quyen');
      if (response.data) {
        const dotTheoKhoa = response.data
          .filter((item: any) => {
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

  const handleDotChange = async (selectedOption: any) => {
    const newDot = selectedOption?.value || '';
    setSelectedDot(newDot);

    setFileCounts({});
    setStoredFiles({});

    if (newDot) {
      try {
        const phanQuyenResponse = await axios.get(
          'http://172.16.0.60:83/api/phan_quyen',
        );

        const danhGiaResponse = await axios.get(
          'http://172.16.0.60:83/api/danh_gia_khoa',
        );

        const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
          const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
          return (
            formatDate(timestamp) === newDot && danhGia.ten_khoa === khoaPhong
          );
        });

        const selectedPhanQuyen = phanQuyenResponse.data.find(
          (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === newDot,
        );

        if (selectedPhanQuyen) {
          const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
            (pq: any) => pq.ten_khoa === khoaPhong,
          );

          if (khoaPhongData) {
            setDanhSachTieuChiTheoKhoa(khoaPhongData.danh_sach_tieu_chi);
          }
        }

        let shouldLockEvaluation = false;
        const scores: Record<string, number> = {};
        const notes: Record<string, string> = {};
        const evaluators: Record<string, string> = {};

        if (selectedEvaluation) {
          setEvaluationExists(true);

          const filesResponse = await axios.get(
            'http://172.16.0.60:83/api/list_files',
          );

          const filesForThisEvaluation = filesResponse.data.filter(
            (file: any) => file.id_dot_danh_gia === selectedEvaluation._id,
          );

          const counts: Record<string, number> = {};

          const filesByTieuMucCon: FilesByTieuMucCon = {};

          if (filesForThisEvaluation && filesForThisEvaluation.length > 0) {
            filesForThisEvaluation.forEach((file: any) => {
              counts[file.id_tieumuccon] =
                (counts[file.id_tieumuccon] || 0) + 1;

              if (!filesByTieuMucCon[file.id_tieumuccon]) {
                filesByTieuMucCon[file.id_tieumuccon] = [];
              }

              filesByTieuMucCon[file.id_tieumuccon].push({
                fileId: file.file_id,
                fileName: file.filename,
                id_tieumuccon: file.id_tieumuccon,
              });
            });
          }

          setFileCounts(counts);
          setStoredFiles(filesByTieuMucCon);

          selectedEvaluation.danh_sach_danh_gia.forEach((danhGia: any) => {
            danhGia.tieu_muc.forEach((tieuMuc: any) => {
              if (tieuMuc.ghichu_danhgia) {
                const danhGiaPairs = tieuMuc.ghichu_danhgia.split(',');
                danhGiaPairs.forEach((pair: string) => {
                  const [id, score] = pair.split(':');
                  if (id && score) {
                    scores[id] = parseInt(score);
                  }
                });
              }
              if (tieuMuc.danh_gia === 10 || tieuMuc.danh_gia === 11) {
                shouldLockEvaluation = true;
              }
              if (tieuMuc.mota_danhgia) {
                const moTaPairs = tieuMuc.mota_danhgia.split(',');
                moTaPairs.forEach((pair: string) => {
                  const [id, note] = pair.split(':');
                  if (id && note) {
                    notes[id] = note === 'none' ? '' : note || '';
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
        } else {
          setEvaluationExists(false);
        }

        setEvaluatorNames(evaluators);
        setIsEvaluationLocked(shouldLockEvaluation);
        setEvaluationScores(scores);
        setEvaluationNotes(notes);

        localStorage.removeItem('storedFiles');
        localStorage.removeItem('uploadedFiles');
      } catch (error) {
        console.error(error);
        messageApi.error('Đã có lỗi xảy ra khi tải dữ liệu');
      }
    } else {
      setDanhSachTieuChiTheoKhoa([]);
      setEvaluationScores({});
      setEvaluationNotes({});
    }
  };

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

  const handleEvaluationChange = (id_tieumuccon: string, value: number) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [id_tieumuccon]: value,
    }));
  };

  const printReport = async () => {
    try {
      const response = await DanhSachDanhGia();

      const selectedEvaluation = response.find((danhGia: any) => {
        const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
        return formatDate(timestamp) === selectedDot;
      });

      if (!selectedEvaluation) {
        messageApi.error('Không tìm thấy dữ liệu đánh giá cho đợt này');
        return;
      }

      let totalCriteria = 0;
      let passedCriteria = 0;

      const tieuChiEvaluations = danhSachTieuChiTheoKhoa.map((tieuChi) => {
        totalCriteria++;

        let allTieuMucConPassed = true;
        let totalTieuMucCon = 0;
        let passedTieuMucCon = 0;

        tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
          if (
            (tieuMuc.hidden === 0 || tieuMuc.hidden === undefined) &&
            tieuMuc.cac_tieu_muc_con
          ) {
            tieuMuc.cac_tieu_muc_con.forEach((tieuMucCon) => {
              if (tieuMucCon.hidden === 0 || tieuMucCon.hidden === undefined) {
                totalTieuMucCon++;
                if (evaluationScores[tieuMucCon.id_tieumuccon] === 1) {
                  passedTieuMucCon++;
                } else {
                  allTieuMucConPassed = false;
                }
              }
            });
          }
        });

        if (allTieuMucConPassed && totalTieuMucCon > 0) {
          passedCriteria++;
        }

        return {
          id: tieuChi.id_tieuchi,
          so_tieuchi: tieuChi.so_tieuchi,
          ten_tieuchi: tieuChi.ten_tieuchi,
          mo_ta: tieuChi.mo_ta,
          isPassed: allTieuMucConPassed && totalTieuMucCon > 0,
          totalTieuMucCon,
          passedTieuMucCon,
        };
      });

      const failedCriteria = totalCriteria - passedCriteria;
      const completionRate =
        totalCriteria > 0 ? (passedCriteria / totalCriteria) * 100 : 0;
      const completionRateFormatted = completionRate.toFixed(1);

      let tableRows = '';

      tieuChiEvaluations.forEach((tieuChi) => {
        const isPass = tieuChi.isPassed;
        const statusBadge = isPass
          ? `<span class="status-badge passed-badge"><i class="fas fa-check"></i> Đạt</span>`
          : `<span class="status-badge failed-badge"><i class="fas fa-times"></i> Không đạt</span>`;

        tableRows += `
          <tr>
            <td>${tieuChi.so_tieuchi}</td>
            <td>
              <strong>${tieuChi.ten_tieuchi}</strong>
              <p>${tieuChi.mo_ta || ''}</p>
            </td>
            <td>${statusBadge}</td>
          
          </tr>
        `;
      });

      let recommendations = '';
      if (failedCriteria > 0) {
        recommendations =
          '<p><i class="fas fa-exclamation-circle"></i> Cần cải thiện các tiêu chí chưa đạt.</p>';

        tieuChiEvaluations.forEach((tieuChi) => {
          if (!tieuChi.isPassed) {
            recommendations += `<p><i class="fas fa-wrench"></i> TC-${tieuChi.so_tieuchi}: Cần hoàn thiện các tiểu mục con trong tiêu chí "${tieuChi.ten_tieuchi}"</p>`;
          }
        });
      } else {
        recommendations =
          '<p><i class="fas fa-check-circle"></i> Tất cả tiêu chí đều đạt yêu cầu. Tiếp tục duy trì chất lượng.</p>';
      }

      const dateParts = selectedDot.split(' ')[0].split('/');
      const timeParts = selectedDot.split(' ')[1].split(':');

      const dateObj = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        parseInt(timeParts[2]),
      );

      const endDate = new Date(dateObj);
      endDate.setMonth(endDate.getMonth() + 6);

      const formatDateTimeString = (date: Date) => {
        return `${String(date.getDate()).padStart(2, '0')}/${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}/${date.getFullYear()} ${String(
          date.getHours(),
        ).padStart(2, '0')}:${String(date.getMinutes()).padStart(
          2,
          '0',
        )}:${String(date.getSeconds()).padStart(2, '0')}`;
      };

      const dateRange = `${formatDateTimeString(dateObj)}`;

      const printContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Báo cáo Đánh giá Chất lượng</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
              :root {
                  --primary-blue: #002244;
                  --secondary-blue: #005B96;
                  --accent-blue: #e6f0ff;
                  --passed: #2E8B57;
                  --failed: #FFA500;
              }
  
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  margin: 2rem;
                  background-color: #f8f9fa;
              }
  
              .report-container {
                  max-width: 1200px;
                  margin: 0 auto;
                  background: white;
                  padding: 2rem;
                  border-radius: 15px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
  
              .header {
                  text-align: center;
                  border-bottom: 3px solid var(--primary-blue);
                  padding-bottom: 1rem;
                  margin-bottom: 2rem;
              }
  
              .header h1 {
                  color: var(--primary-blue);
                  font-size: 2.5rem;
                  margin: 0.5rem 0;
              }
  
              .overview-cards {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 1.5rem;
                  margin-bottom: 2rem;
              }
  
              .card {
                  background: var(--accent-blue);
                  padding: 1.5rem;
                  border-radius: 10px;
                  text-align: center;
              }
  
              .card i {
                  font-size: 2rem;
                  color: var(--secondary-blue);
                  margin-bottom: 1rem;
              }
  
              .status-badge {
                  display: inline-block;
                  padding: 0.3rem 0.8rem;
                  border-radius: 20px;
                  font-weight: bold;
              }
  
              .passed-badge {
                  background: var(--passed);
                  color: white;
              }
  
              .failed-badge {
                  background: var(--failed);
                  color: white;
              }
  
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 2rem 0;
              }
  
              th {
                  background: var(--primary-blue);
                  color: white;
                  padding: 1rem;
                  text-align: left;
              }
  
              td {
                  padding: 1rem;
                  border-bottom: 1px solid #ddd;
              }
  
              tr:hover {
                  background-color: #f5f5f5;
              }
  
              .progress-bar {
                  width: 100%;
                  height: 20px;
                  background: #ddd;
                  border-radius: 10px;
                  overflow: hidden;
              }
  
              .progress-fill {
                  height: 100%;
                  background: var(--secondary-blue);
                  width: ${completionRate}%;
                  transition: width 0.5s ease;
              }
  
              .recommendation-box {
                  background: var(--accent-blue);
                  padding: 1.5rem;
                  border-left: 4px solid var(--secondary-blue);
                  margin: 1rem 0;
              }
  
              @media print {
                  body {
                      padding: 0;
                      background: white;
                  }
                  
                  .report-container {
                      box-shadow: none;
                  }
              }
          </style>
      </head>
      <body>
          <div class="report-container">
              <div class="header">
                  <h1><i class="fas fa-hospital"></i> Báo cáo Đánh giá Chất lượng</h1>
                  <div class="meta-info">
                      <p><i class="fas fa-clipboard-list"></i> Khoa/Phòng: ${khoaPhong}</p>
                      <p><i class="fas fa-calendar-alt"></i> Thời gian: ${dateRange}</p>
                  </div>
              </div>
  
              <div class="overview-cards">
                  <div class="card">
                      <i class="fas fa-check-circle"></i>
                      <h3>Tiêu chí đạt</h3>
                      <p class="stat-number">${passedCriteria}/${totalCriteria}</p>
                  </div>
  
                  <div class="card">
                      <i class="fas fa-exclamation-triangle"></i>
                      <h3>Tiêu chí không đạt</h3>
                      <p class="stat-number">${failedCriteria}</p>
                  </div>
  
                  <div class="card">
                      <i class="fas fa-chart-line"></i>
                      <h3>Tỷ lệ hoàn thành</h3>
                      <p class="stat-number">${completionRateFormatted}%</p>
                  </div>
              </div>
  
              <div class="progress-bar">
                  <div class="progress-fill"></div>
              </div>
  
              <h2><i class="fas fa-list-ul"></i> Chi tiết tiêu chí</h2>
              <table>
                  <thead>
                      <tr>
                         <th>Tiêu chí</th>
                         <th>Nội dung</th>
                         <th>Trạng thái</th>

                    </tr>
               </thead>
                  <tbody>
                      ${tableRows}
                  </tbody>
              </table>
  
             
          </div>
      </body>
      </html>
      `;

      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
        }, 1000);
      } else {
        messageApi.error(
          'Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt của bạn.',
        );
      }
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi tạo báo cáo');
    }
  };

  function convertToGMTString(dateStr: string) {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
    );

    return date.toUTCString();
  }

  const handleNoteChange = (id_tieumuccon: string, value: string) => {
    setEvaluationNotes((prev) => ({
      ...prev,
      [id_tieumuccon]: value,
    }));
  };

  const luuChoDanhGiaMoi = async () => {
    try {
      const evaluationData = {
        danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
          id_tieuchi: tieuChi.id_tieuchi,
          tieu_muc: tieuChi.cac_tieu_muc
            .filter((tm) => tm.hidden === 0 || tm.hidden === undefined)
            .filter(
              (tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0,
            )
            .map((tieuMuc) => {
              const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
                ?.filter((tmc) => tmc.hidden === 0 || tmc.hidden === undefined)
                ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

              const danhGiaTieuMucConString = tieuMuc.cac_tieu_muc_con
                ?.filter(
                  (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
                )
                ?.map(
                  (tmc: any) =>
                    `${tmc.id_tieumuccon}:${
                      evaluationScores[tmc.id_tieumuccon] || 0
                    }`,
                )
                .join(',');

              const danhGiaVaGhiChuString = tieuMuc.cac_tieu_muc_con
                ?.filter(
                  (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
                )
                ?.map((tmc: any) => {
                  const ghiChu = evaluationNotes[tmc.id_tieumuccon] || 'none';
                  return `${tmc.id_tieumuccon}:${ghiChu}`;
                })
                .join(',');

              const evaluatorNamesString = tieuMuc.cac_tieu_muc_con
                ?.filter(
                  (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
                )
                ?.map((tmc: any) => {
                  const evaluatorName =
                    evaluatorNames[tmc.id_tieumuccon] || 'none';
                  return `${tmc.id_tieumuccon}:${evaluatorName}`;
                })
                .join(',');

              return {
                id_tieumuc: tieuMuc.id_tieumuc,
                danh_gia: allTieuMucConDat ? 1 : 0,
                ghichu_danhgia: danhGiaTieuMucConString,
                mota_danhgia: danhGiaVaGhiChuString,
                // nguoi_danhgia: evaluatorNamesString,
              };
            }),
        })),
        ten_khoa: khoaPhong,
        nhan_vien: `${tenNhanVien}-${convertToGMTString(selectedDot)}`,
      };

      // Thực hiện tạo đánh giá mới trước
      const response = await axios.post(
        'http://172.16.0.60:83/api/danh_gia_khoa',
        evaluationData,
      );

      const newEvaluationId = response.data._id;

      // Sau khi tạo đánh giá thành công, thực hiện ghi log cho từng tiêu mục
      const logPromises = danhSachTieuChiTheoKhoa.flatMap((tieuChi) =>
        tieuChi.cac_tieu_muc
          .filter((tm) => tm.hidden === 0 || tm.hidden === undefined)
          .filter((tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0)
          .map(async (tieuMuc) => {
            await axios.post('http://172.16.0.60:83/api/log_danh_gia', {
              hanh_dong: 'danh_gia',
              id_danh_gia: newEvaluationId,
              id_tieuchi: tieuChi.id_tieuchi,
              id_tieumuc: tieuMuc.id_tieumuc,
              nguoi_thuc_hien: tenNhanVien,
              ten_khoa: khoaPhong,
              ten_tieuchi: tieuChi.ten_tieuchi,
              ten_tieumuc: tieuMuc.ten_tieu_muc,
            });
          }),
      );

      await Promise.all(logPromises);
      setStatus(randomString());
      messageApi.success('Thêm mới đánh giá thành công');
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
    }
  };

  const luuChoDanhGiaNay = async () => {
    try {
      const evaluationsResponse = await DanhSachDanhGia();
      const selectedEvaluation = evaluationsResponse.find((evaluation: any) => {
        const timestamp = evaluation.nhan_vien.split('-')[1]?.trim();
        return (
          formatDate(timestamp) === selectedDot &&
          evaluation.ten_khoa === khoaPhong
        );
      });

      if (!selectedEvaluation) {
        messageApi.error('Không tìm thấy đợt đánh giá');
        return;
      }

      const updatePromises = danhSachTieuChiTheoKhoa.flatMap((tieuChi) =>
        tieuChi.cac_tieu_muc
          .filter((tm) => tm.hidden === 0 || tm.hidden === undefined)
          .filter((tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0)
          .map(async (tieuMuc) => {
            const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
              ?.filter((tmc) => tmc.hidden === 0 || tmc.hidden === undefined)
              ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

            const danhGiaTieuMucConString = tieuMuc.cac_tieu_muc_con
              ?.filter(
                (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
              )
              ?.map(
                (tmc: any) =>
                  `${tmc.id_tieumuccon}:${
                    evaluationScores[tmc.id_tieumuccon] || 0
                  }`,
              )
              .join(',');

            const danhGiaVaGhiChuString = tieuMuc.cac_tieu_muc_con
              ?.filter(
                (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
              )
              ?.map((tmc: any) => {
                const ghiChu = evaluationNotes[tmc.id_tieumuccon] || 'none';
                return `${tmc.id_tieumuccon}:${ghiChu}`;
              })
              .join(',');

            const evaluatorNamesString = tieuMuc.cac_tieu_muc_con
              ?.filter(
                (tmc: any) => tmc.hidden === 0 || tmc.hidden === undefined,
              )
              ?.map((tmc: any) => {
                const evaluatorName =
                  evaluatorNames[tmc.id_tieumuccon] || 'none';
                return `${tmc.id_tieumuccon}:${evaluatorName}`;
              })
              .join(',');

            // Thực hiện updatePromise trước
            await axios.put(
              'http://172.16.0.60:83/api/cap_nhat_danh_gia_tieu_muc',
              {
                id_danh_gia: selectedEvaluation._id,
                id_tieuchi: tieuChi.id_tieuchi,
                id_tieumuc: tieuMuc.id_tieumuc,
                danh_gia: allTieuMucConDat ? 1 : 0,
                ghichu_danhgia: danhGiaTieuMucConString,
                mota_danhgia: danhGiaVaGhiChuString,
                // nguoi_danhgia: evaluatorNamesString,
              },
            );

            // Sau khi updatePromise hoàn thành, thực hiện logPromise
            await axios.post('http://172.16.0.60:83/api/log_danh_gia', {
              hanh_dong: 'danh_gia',
              id_danh_gia: selectedEvaluation._id,
              id_tieuchi: tieuChi.id_tieuchi,
              id_tieumuc: tieuMuc.id_tieumuc,
              nguoi_thuc_hien: tenNhanVien,
              ten_khoa: khoaPhong,
              ten_tieuchi: tieuChi.ten_tieuchi,
              ten_tieumuc: tieuMuc.ten_tieu_muc,
            });
          }),
      );

      await Promise.all(updatePromises);
      setStatus(randomString());
      messageApi.success('Cập nhật đánh giá thành công');
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi cập nhật đánh giá');
    }
  };

  useEffect(() => {
    const savedFiles = localStorage.getItem('storedFiles');
    if (savedFiles) {
      setStoredFiles(JSON.parse(savedFiles));
    }
  }, []);

  const randomString = (length = 8) => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSave = () => {
    if (evaluationExists) {
      luuChoDanhGiaNay();
    } else {
      luuChoDanhGiaMoi();
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id_tieumuccon: string,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const existingFilesResponse = await axios.get(
        'http://172.16.0.60:83/api/list_files',
      );

      const danhGiaResponse = await axios.get(
        'http://172.16.0.60:83/api/danh_gia_khoa',
      );

      const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
        const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
        return (
          formatDate(timestamp) === selectedDot &&
          danhGia.ten_khoa === khoaPhong
        );
      });

      if (!selectedEvaluation) {
        messageApi.error('Không tìm thấy đợt đánh giá hiện tại');
        e.target.value = '';
        return;
      }

      const id_dot_danh_gia = selectedEvaluation._id;

      const departmentFiles = existingFilesResponse.data.filter(
        (file: any) => file.id_dot_danh_gia === id_dot_danh_gia,
      );

      for (let i = 0; i < files.length; i++) {
        const isDuplicate = departmentFiles.some(
          (existingFile: any) => existingFile.filename === files[i].name,
        );

        if (isDuplicate) {
          messageApi.warning(
            `File "${files[i].name}" đã được tải lên trong đợt đánh giá này của khoa phòng ${khoaPhong}`,
          );
          e.target.value = '';
          return;
        }

        const formData = new FormData();
        formData.append('file', files[i]);

        await fetch(
          `http://172.16.0.60:83/api/upload_file/${id_dot_danh_gia}/${id_tieumuccon}`,
          {
            method: 'POST',
            body: formData,
          },
        );
      }

      setStatus(randomString());
      messageApi.success('Tải file lên thành công');
      e.target.value = '';
    } catch (error) {
      console.error(error);
      e.target.value = '';
      messageApi.error('Lỗi khi tải file lên');
    }
  };

  const handleDeleteFile = async (id_tieumuccon: string, fileId: string) => {
    try {
      const response = await axios.delete(
        `http://172.16.0.60:83/api/delete_file/${fileId}`,
      );

      if (response.status === 200) {
        const newFiles = storedFiles[id_tieumuccon].filter(
          (file) => file.fileId !== fileId,
        );

        const newStoredFiles = {
          ...storedFiles,
          [id_tieumuccon]: newFiles,
        };

        setStoredFiles(newStoredFiles);
        setStatus(randomString());
        messageApi.success('Xóa file thành công');
      }
    } catch (error) {
      console.error(error);
      messageApi.error('Lỗi khi xóa file');
    }
  };

  const showFileList = async (id_tieumuccon: string) => {
    try {
      if (!selectedDot) {
        messageApi.warning('Vui lòng chọn đợt đánh giá trước');
        return;
      }

      const danhGiaResponse = await axios.get(
        'http://172.16.0.60:83/api/danh_gia_khoa',
      );

      const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
        const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
        return (
          formatDate(timestamp) === selectedDot &&
          danhGia.ten_khoa === khoaPhong
        );
      });

      if (!selectedEvaluation) {
        setStoredFiles({});
        setSelectedTieuMucCon('');
        setIsModalVisible(true);
        return;
      }

      const id_dot_danh_gia = selectedEvaluation._id;

      const response = await axios.get('http://172.16.0.60:83/api/list_files');

      const filteredFiles = response.data.filter(
        (file: any) =>
          file.id_dot_danh_gia === id_dot_danh_gia &&
          file.id_tieumuccon === id_tieumuccon,
      );

      if (filteredFiles.length === 0) {
        setStoredFiles({
          [id_tieumuccon]: [],
        });
      } else {
        setStoredFiles({
          [id_tieumuccon]: filteredFiles.map((file: any) => ({
            fileId: file.file_id,
            fileName: file.filename,
            id_tieumuccon: file.id_tieumuccon,
          })),
        });
      }

      setSelectedTieuMucCon(id_tieumuccon);
      setIsModalVisible(true);
    } catch (error) {
      console.error(error);
      messageApi.error('Lỗi khi tải danh sách file');
    }
  };

  const handleNoteClick = (id_tieumuccon: string) => {
    setSelectedTieuMucCon(id_tieumuccon);
    setTempNote(evaluationNotes[id_tieumuccon] || '');
    setIsNoteModalVisible(true);
    setTimeout(() => {
      const textarea = document.querySelector(
        '.note-textarea',
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }, 100);
  };

  const handleSaveNote = () => {
    setEvaluationNotes((prev) => ({
      ...prev,
      [selectedTieuMucCon]: tempNote,
    }));
    setIsNoteModalVisible(false);
  };

  return (
    <>
      {contextHolder}
      {khoaPhong !== 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xl sm:text-2xl font-bold mb-4">
              Đánh giá tiêu chí {khoaPhong}
            </div>
            <br />
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
                onChange={handleDotChange}
                className="w-full sm:w-1/2 mb-4"
              />
            </div>
            <br />

            {selectedDot && (
              <>
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <button
                    title={
                      isEvaluationLocked
                        ? `Không thể lưu do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
                        : `Lưu đánh giá`
                    }
                    className={`w-full sm:w-auto bg-primary p-2 text-gray font-medium hover:bg-opacity-90 ${
                      isEvaluationLocked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleSave}
                    disabled={isEvaluationLocked}
                  >
                    Lưu thông tin
                  </button>

                  <button
                    title="In báo cáo"
                    className="w-full sm:w-auto bg-success p-2 text-gray font-medium hover:bg-opacity-90"
                    onClick={printReport}
                  >
                    In báo cáo
                  </button>
                </div>

                <br />

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
                      {danhSachTieuChiTheoKhoa &&
                      Array.isArray(danhSachTieuChiTheoKhoa) &&
                      danhSachTieuChiTheoKhoa.length > 0 ? (
                        <>
                          {danhSachTieuChiTheoKhoa
                            .filter(
                              (tc) =>
                                tc.hidden === 0 || tc.hidden === undefined,
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
                                        tm.hidden === 0 ||
                                        tm.hidden === undefined,
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
                                          Array.isArray(
                                            tieuMuc.cac_tieu_muc_con,
                                          ) &&
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
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        handleEvaluationChange(
                                                          tieuMucCon.id_tieumuccon,
                                                          1,
                                                        );
                                                      } else {
                                                        handleEvaluationChange(
                                                          tieuMucCon.id_tieumuccon,
                                                          -1,
                                                        );
                                                      }
                                                    }}
                                                    disabled={
                                                      isEvaluationLocked
                                                    }
                                                    className="h-5 w-5 accent-primary"
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
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        handleEvaluationChange(
                                                          tieuMucCon.id_tieumuccon,
                                                          0,
                                                        );
                                                      } else {
                                                        handleEvaluationChange(
                                                          tieuMucCon.id_tieumuccon,
                                                          -1,
                                                        );
                                                      }
                                                    }}
                                                    disabled={
                                                      isEvaluationLocked
                                                    }
                                                    className="h-5 w-5 accent-primary"
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
                                                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-sm sm:text-base transition-colors duration-200"
                                                      title="Tải file lên"
                                                      onClick={() =>
                                                        document
                                                          .getElementById(
                                                            `file-${tieuMucCon.id_tieumuccon}`,
                                                          )
                                                          ?.click()
                                                      }
                                                      disabled={
                                                        isEvaluationLocked
                                                      }
                                                    >
                                                      <UploadOutlined />
                                                    </button>
                                                    <button
                                                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm sm:text-base transition-colors duration-200"
                                                      title="Thêm ghi chú"
                                                      onClick={() =>
                                                        handleNoteClick(
                                                          tieuMucCon.id_tieumuccon,
                                                        )
                                                      }
                                                      disabled={
                                                        isEvaluationLocked
                                                      }
                                                    >
                                                      <CommentOutlined />
                                                    </button>
                                                    <input
                                                      type="file"
                                                      id={`file-${tieuMucCon.id_tieumuccon}`}
                                                      onChange={(e) =>
                                                        handleFileUpload(
                                                          e,
                                                          tieuMucCon.id_tieumuccon,
                                                        )
                                                      }
                                                      className="hidden"
                                                      multiple
                                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    />
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                      </Fragment>
                                    ))}
                              </Fragment>
                            ))}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} className="border p-4 text-center">
                            {loadingDanhMuc ? (
                              <div className="flex justify-center items-center">
                                <LoadingOutlined
                                  style={{ fontSize: '24px' }}
                                  className="mr-2"
                                />{' '}
                                Đang tải dữ liệu...
                              </div>
                            ) : (
                              'Không tìm thấy tiêu chí nào'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
          extra={<Link to="/">Quay lại Trang chủ</Link>}
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
            {storedFiles[selectedTieuMucCon] &&
            storedFiles[selectedTieuMucCon].length > 0 ? (
              <List
                dataSource={storedFiles[selectedTieuMucCon]}
                renderItem={(item) => (
                  <List.Item
                    key={item.fileId}
                    actions={[
                      <span
                        title="Tải file về"
                        onClick={() =>
                          window.open(
                            `http://172.16.0.60:83/api/download_file/${item.fileId}`,
                            '_blank',
                          )
                        }
                        className="text-primary hover:text-primary-dark cursor-pointer"
                      >
                        <DownloadOutlined />
                      </span>,
                      <span
                        title={
                          isEvaluationLocked
                            ? `Không thể xóa do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
                            : `Xóa file`
                        }
                        onClick={() =>
                          !isEvaluationLocked &&
                          handleDeleteFile(selectedTieuMucCon, item.fileId)
                        }
                        className={`text-danger hover:text-danger-dark ${
                          isEvaluationLocked
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        } `}
                      >
                        <DeleteOutlined />
                      </span>,
                    ]}
                  >
                    <div>{item.fileName}</div>
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
        title="Nhập ghi chú đánh giá"
        open={isNoteModalVisible}
        onOk={handleSaveNote}
        onCancel={() => setIsNoteModalVisible(false)}
        width={600}
        okText="Lưu ghi chú"
        okButtonProps={{
          className: 'bg-blue-500 hover:bg-blue-600 text-white border-none',
          style: {
            padding: '4px 16px',
            height: '32px',
            borderRadius: '4px',
            transition: 'all 0.3s',
          },
        }}
        cancelButtonProps={{
          className: 'border-gray-300 hover:border-gray-400',
          style: {
            padding: '4px 16px',
            height: '32px',
            borderRadius: '4px',
            transition: 'all 0.3s',
          },
        }}
      >
        <textarea
          value={tempNote}
          onChange={(e) => {
            setTempNote(e.target.value);
            const textarea = e.target as HTMLTextAreaElement;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
          }}
          className="w-full p-2 border rounded note-textarea"
          rows={4}
          placeholder="Nhập ghi chú đánh giá..."
          disabled={isEvaluationLocked}
        />
      </Modal>
    </>
  );
};

export default DanhGiaTieuChiKhoaPhong;
