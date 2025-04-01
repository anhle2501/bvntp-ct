// import { useEffect, useState } from 'react';
// import './ChiTieuCap1.css';
// import { List, message, Modal, Result } from 'antd';
// import {
//   DeleteOutlined,
//   DownloadOutlined,
//   LoadingOutlined,
// } from '@ant-design/icons';
// import { DanhMuc } from '../../types/danhmuc';
// import Select from 'react-select';
// import axios from 'axios';
// import { DanhSachDanhGia } from '../../api/ChiTieuAPI';
// import { Link, useNavigate } from 'react-router-dom';
// import { UploadOutlined, EyeOutlined } from '@ant-design/icons';

// interface StoredFile {
//   fileId: string;
//   fileName: string;
//   id_tieumuccon: string;
// }

// interface FilesByTieuMucCon {
//   [key: string]: StoredFile[];
// }

// const DanhGiaTieuChiKhoaPhong: React.FC = () => {
//   const [storedFiles, setStoredFiles] = useState<FilesByTieuMucCon>({});
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedTieuMucCon, setSelectedTieuMucCon] = useState<string>('');

//   const [selectedDot, setSelectedDot] = useState<string>('');
//   const [evaluationScores, setEvaluationScores] = useState<
//     Record<string, number>
//   >({});
//   const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

//   const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
//     DanhMuc[]
//   >([]);

//   const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

//   const [khoaPhong, setKhoaPhong] = useState('');
//   const [tenNhanVien, setTenNhanVien] = useState('');

//   const [messageApi, contextHolder] = message.useMessage();

//   // const { khoaPhong, tenNhanVien } = useContext(UserContext);

//   const [danhSachDot, setDanhSachDot] = useState<any[]>([]);

//   const [status, setStatus] = useState<string>('');

//   const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);

//   const [filesByTieuMucCon, setFilesByTieuMucCon] = useState<
//     Record<string, File>
//   >({});

//   const [evaluationExists, setEvaluationExists] = useState(false);

//   const [apiTimestamp, setApiTimestamp] = useState('');

//   const [evaluationNotes, setEvaluationNotes] = useState<
//     Record<string, string>
//   >({});

//   const [evaluatorNames, setEvaluatorNames] = useState<Record<string, string>>(
//     {},
//   );

//   // Add search functionality
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [filteredTieuChi, setFilteredTieuChi] = useState<DanhMuc[]>([]);

//   // Add state to track which items match the search
//   const [searchResults, setSearchResults] = useState<{
//     tieuChi: Record<string, boolean>;
//     tieuMuc: Record<string, boolean>;
//     tieuMucCon: Record<string, boolean>;
//   }>({
//     tieuChi: {},
//     tieuMuc: {},
//     tieuMucCon: {},
//   });

//   const navigate = useNavigate();

//   const [decodeWorkerDangNhap] = useState(
//     () => new Worker('/decodeWorkerDangNhap.js'),
//   );

//   const handleDecodeDangNhap = (encodedString: any) => {
//     return new Promise((resolve, reject) => {
//       if (decodeWorkerDangNhap) {
//         decodeWorkerDangNhap.postMessage(encodedString);
//         decodeWorkerDangNhap.onmessage = function (e) {
//           resolve(e.data);
//         };
//       } else {
//         console.log('Giải mã thông tin đăng nhập không thành công');
//       }
//     });
//   };

//   const handleEvaluatorNameChange = (id_tieumuccon: string, value: string) => {
//     setEvaluatorNames((prev) => ({
//       ...prev,
//       [id_tieumuccon]: value,
//     }));
//   };

//   // Add this effect to filter the data when searchTerm or danhSachTieuChiTheoKhoa changes
//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
//       setFilteredTieuChi(danhSachTieuChiTheoKhoa);
//       setSearchResults({
//         tieuChi: {},
//         tieuMuc: {},
//         tieuMucCon: {},
//       });
//       return;
//     }

//     const lowercasedSearch = searchTerm.toLowerCase();
//     const matchedTieuChi: Record<string, boolean> = {};
//     const matchedTieuMuc: Record<string, boolean> = {};
//     const matchedTieuMucCon: Record<string, boolean> = {};

//     // Lọc tiêu chí phù hợp với từ khóa
//     const filtered = danhSachTieuChiTheoKhoa.filter((tieuChi) => {
//       let tieuChiMatches = false;
//       let anyMatch = false;

//       // Kiểm tra tiêu chí
//       if (
//         tieuChi.so_tieuchi.toString().includes(lowercasedSearch) ||
//         (tieuChi.ten_tieuchi &&
//           tieuChi.ten_tieuchi.toLowerCase().includes(lowercasedSearch)) ||
//         (tieuChi.mo_ta &&
//           tieuChi.mo_ta.toLowerCase().includes(lowercasedSearch))
//       ) {
//         matchedTieuChi[tieuChi.so_tieuchi] = true;
//         tieuChiMatches = true;
//         anyMatch = true;
//       }

//       // Kiểm tra tiểu mục
//       if (tieuChi.cac_tieu_muc && Array.isArray(tieuChi.cac_tieu_muc)) {
//         tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
//           if (
//             tieuMuc.so_tieu_muc.toString().includes(lowercasedSearch) ||
//             (tieuMuc.ten_tieu_muc &&
//               tieuMuc.ten_tieu_muc.toLowerCase().includes(lowercasedSearch)) ||
//             (tieuMuc.mo_ta_tieu_muc &&
//               tieuMuc.mo_ta_tieu_muc.toLowerCase().includes(lowercasedSearch))
//           ) {
//             matchedTieuMuc[`${tieuChi.so_tieuchi}-${tieuMuc.so_tieu_muc}`] =
//               true;
//             anyMatch = true;
//           }

//           // Kiểm tra tiểu mục con
//           if (
//             tieuMuc.cac_tieu_muc_con &&
//             Array.isArray(tieuMuc.cac_tieu_muc_con)
//           ) {
//             tieuMuc.cac_tieu_muc_con.forEach((tieuMucCon) => {
//               if (
//                 tieuMucCon.so_tieu_muc_con
//                   .toString()
//                   .includes(lowercasedSearch) ||
//                 (tieuMucCon.ten_tieu_muc_con &&
//                   tieuMucCon.ten_tieu_muc_con
//                     .toLowerCase()
//                     .includes(lowercasedSearch)) ||
//                 (tieuMucCon.mo_ta_tieu_muc_con &&
//                   tieuMucCon.mo_ta_tieu_muc_con
//                     .toLowerCase()
//                     .includes(lowercasedSearch))
//               ) {
//                 matchedTieuMucCon[
//                   `${tieuChi.so_tieuchi}-${tieuMuc.so_tieu_muc}-${tieuMucCon.so_tieu_muc_con}`
//                 ] = true;
//                 anyMatch = true;
//               }
//             });
//           }
//         });
//       }

//       return anyMatch;
//     });

//     setFilteredTieuChi(filtered);
//     setSearchResults({
//       tieuChi: matchedTieuChi,
//       tieuMuc: matchedTieuMuc,
//       tieuMucCon: matchedTieuMucCon,
//     });
//   }, [searchTerm, danhSachTieuChiTheoKhoa]);

//   // Handler for search input changes
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   // const getFileCounts = async () => {
//   //   try {
//   //     // Đặt lại fileCounts ngay từ đầu
//   //     setFileCounts({});

//   //     if (!selectedDot || !khoaPhong) {
//   //       return; // Không làm gì nếu chưa chọn đợt hoặc không có khoa phòng
//   //     }

//   //     const [filesResponse, phanQuyenResponse, danhGiaResponse] =
//   //       await Promise.all([
//   //         axios.get('http://172.16.0.60:883/api/list_files'),
//   //         axios.get('http://172.16.0.60:883/api/phan_quyen'),
//   //         axios.get('http://172.16.0.60:883/api/danh_gia_khoa'),
//   //       ]);

//   //     const selectedPhanQuyen = phanQuyenResponse.data.find(
//   //       (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === selectedDot,
//   //     );

//   //     if (!selectedPhanQuyen) {
//   //       console.log('Không tìm thấy đợt phân quyền');
//   //       return;
//   //     }

//   //     // Tìm đánh giá cụ thể cho khoa phòng HIỆN TẠI và đợt đánh giá đã chọn
//   //     const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//   //       const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//   //       return (
//   //         formatDate(timestamp) === selectedDot &&
//   //         danhGia.ten_khoa === khoaPhong // Đảm bảo sử dụng khoa phòng của người dùng đã đăng nhập
//   //       );
//   //     });

//   //     if (!selectedEvaluation) {
//   //       console.log('Không tìm thấy đánh giá cho đợt này và khoa phòng này');
//   //       return;
//   //     }

//   //     const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
//   //       (pq: any) => pq.ten_khoa === khoaPhong,
//   //     );

//   //     if (!khoaPhongData) {
//   //       console.log('Không tìm thấy dữ liệu khoa phòng');
//   //       return;
//   //     }

//   //     const validTieuMucConIds: string[] = [];
//   //     khoaPhongData.danh_sach_tieu_chi.forEach((tieuChi: any) => {
//   //       tieuChi.cac_tieu_muc.forEach((tieuMuc: any) => {
//   //         tieuMuc.cac_tieu_muc_con?.forEach((tieuMucCon: any) => {
//   //           validTieuMucConIds.push(tieuMucCon.id_tieumuccon);
//   //         });
//   //       });
//   //     });

//   //     const counts: Record<string, number> = {};

//   //     // Kiểm tra xem có file nào không
//   //     if (
//   //       filesResponse.data &&
//   //       Array.isArray(filesResponse.data) &&
//   //       filesResponse.data.length > 0
//   //     ) {
//   //       filesResponse.data.forEach((file: any) => {
//   //         // Chỉ đếm file thuộc về đánh giá của khoa phòng hiện tại
//   //         const fileDate = file.id_dot_danh_gia;
//   //         const isSameDate = fileDate === selectedEvaluation._id;

//   //         if (validTieuMucConIds.includes(file.id_tieumuccon) && isSameDate) {
//   //           counts[file.id_tieumuccon] = (counts[file.id_tieumuccon] || 0) + 1;
//   //         }
//   //       });
//   //     }

//   //     // Cập nhật state
//   //     setFileCounts(counts);
//   //     console.log('file count: ', counts);

//   //     // Cập nhật localStorage nếu cần
//   //     localStorage.setItem('fileCounts', JSON.stringify(counts));
//   //   } catch (error) {
//   //     console.error('Lỗi khi lấy số lượng file:', error);
//   //     // Đặt lại fileCounts nếu có lỗi
//   //     setFileCounts({});
//   //   }
//   // };

//   //main // const getFileCounts = async () => {
//   //   try {
//   //     // Đặt lại fileCounts ngay từ đầu
//   //     setFileCounts({});

//   //     if (!selectedDot || !khoaPhong) {
//   //       return; // Không làm gì nếu chưa chọn đợt hoặc không có khoa phòng
//   //     }

//   //     const [filesResponse, phanQuyenResponse, danhGiaResponse] =
//   //       await Promise.all([
//   //         axios.get('http://172.16.0.60:883/api/list_files'),
//   //         axios.get('http://172.16.0.60:883/api/phan_quyen'),
//   //         axios.get('http://172.16.0.60:883/api/danh_gia_khoa'),
//   //       ]);

//   //     const selectedPhanQuyen = phanQuyenResponse.data.find(
//   //       (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === selectedDot,
//   //     );

//   //     if (!selectedPhanQuyen) {
//   //       console.log('Không tìm thấy đợt phân quyền');
//   //       return;
//   //     }

//   //     const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//   //       const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//   //       return (
//   //         formatDate(timestamp) === selectedDot &&
//   //         danhGia.ten_khoa === khoaPhong
//   //       );
//   //     });

//   //     if (!selectedEvaluation) {
//   //       console.log('Không tìm thấy đánh giá cho đợt này');
//   //       return;
//   //     }

//   //     const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
//   //       (pq: any) => pq.ten_khoa === khoaPhong,
//   //     );

//   //     if (!khoaPhongData) {
//   //       console.log('Không tìm thấy dữ liệu khoa phòng');
//   //       return;
//   //     }

//   //     const validTieuMucConIds: string[] = [];
//   //     khoaPhongData.danh_sach_tieu_chi.forEach((tieuChi: any) => {
//   //       tieuChi.cac_tieu_muc.forEach((tieuMuc: any) => {
//   //         tieuMuc.cac_tieu_muc_con?.forEach((tieuMucCon: any) => {
//   //           validTieuMucConIds.push(tieuMucCon.id_tieumuccon);
//   //         });
//   //       });
//   //     });

//   //     const counts: Record<string, number> = {};

//   //     // Kiểm tra xem có file nào không
//   //     if (
//   //       filesResponse.data &&
//   //       Array.isArray(filesResponse.data) &&
//   //       filesResponse.data.length > 0
//   //     ) {
//   //       filesResponse.data.forEach((file: any) => {
//   //         const fileDate = file.id_dot_danh_gia;
//   //         const isSameDate = fileDate === selectedEvaluation._id;

//   //         if (validTieuMucConIds.includes(file.id_tieumuccon) && isSameDate) {
//   //           counts[file.id_tieumuccon] = (counts[file.id_tieumuccon] || 0) + 1;
//   //         }
//   //       });
//   //     }

//   //     // Cập nhật state
//   //     setFileCounts(counts);
//   //     console.log('file count: ', counts);

//   //     // Cập nhật localStorage nếu cần
//   //     localStorage.setItem('fileCounts', JSON.stringify(counts));
//   //   } catch (error) {
//   //     console.error('Lỗi khi lấy số lượng file:', error);
//   //     // Đặt lại fileCounts nếu có lỗi
//   //     setFileCounts({});
//   //   }
//   // };

//   const getFileCounts = async () => {
//     try {
//       setFileCounts({});

//       if (!selectedDot || !khoaPhong) {
//         return;
//       }

//       const [filesResponse, phanQuyenResponse, danhGiaResponse] =
//         await Promise.all([
//           axios.get('http://172.16.0.60:883/api/list_files'),
//           axios.get('http://172.16.0.60:883/api/phan_quyen'),
//           axios.get('http://172.16.0.60:883/api/danh_gia_khoa'),
//         ]);

//       const selectedPhanQuyen = phanQuyenResponse.data.find(
//         (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === selectedDot,
//       );

//       if (!selectedPhanQuyen) {
//         console.log('Không tìm thấy đợt phân quyền');
//         return;
//       }

//       // Tìm đánh giá cụ thể cho khoa phòng HIỆN TẠI và đợt đánh giá đã chọn
//       const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//         const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//         return (
//           formatDate(timestamp) === selectedDot &&
//           danhGia.ten_khoa === khoaPhong // Đảm bảo sử dụng khoa phòng của người dùng đã đăng nhập
//         );
//       });

//       if (!selectedEvaluation) {
//         console.log('Không tìm thấy đánh giá cho đợt này và khoa phòng này');
//         return;
//       }

//       const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
//         (pq: any) => pq.ten_khoa === khoaPhong,
//       );

//       if (!khoaPhongData) {
//         console.log('Không tìm thấy dữ liệu khoa phòng');
//         return;
//       }

//       const validTieuMucConIds: string[] = [];
//       khoaPhongData.danh_sach_tieu_chi.forEach((tieuChi: any) => {
//         tieuChi.cac_tieu_muc.forEach((tieuMuc: any) => {
//           tieuMuc.cac_tieu_muc_con?.forEach((tieuMucCon: any) => {
//             validTieuMucConIds.push(tieuMucCon.id_tieumuccon);
//           });
//         });
//       });

//       const counts: Record<string, number> = {};

//       // Kiểm tra xem có file nào không
//       if (
//         filesResponse.data &&
//         Array.isArray(filesResponse.data) &&
//         filesResponse.data.length > 0
//       ) {
//         filesResponse.data.forEach((file: any) => {
//           // Chỉ đếm file thuộc về đánh giá của khoa phòng hiện tại
//           const fileDate = file.id_dot_danh_gia;
//           const isSameDate = fileDate === selectedEvaluation._id;

//           if (validTieuMucConIds.includes(file.id_tieumuccon) && isSameDate) {
//             counts[file.id_tieumuccon] = (counts[file.id_tieumuccon] || 0) + 1;
//           }
//         });
//       }

//       setFileCounts(counts);
//       console.log('file count: ', counts);
//       localStorage.setItem('fileCounts', JSON.stringify(counts));
//     } catch (error) {
//       console.error('Lỗi khi lấy số lượng file:', error);
//       setFileCounts({});
//     }
//   };

//   useEffect(() => {
//     if (selectedDot && khoaPhong) {
//       getFileCounts();
//     } else {
//       // Đặt lại fileCounts khi không có đợt được chọn
//       setFileCounts({});
//     }
//   }, [selectedDot, khoaPhong, status]);

//   useEffect(() => {
//     if (khoaPhong) {
//       fetchDataTieuChiTheoKhoa();
//     }
//   }, [khoaPhong]);

//   const checkExistingEvaluation = async () => {
//     try {
//       const response = await axios.get(
//         'http://172.16.0.60:883/api/danh_gia_khoa',
//       );
//       const evaluations = response.data;

//       const exists = evaluations.some((evaluation: any) => {
//         const timestamp = evaluation.nhan_vien.split('-')[1]?.trim();

//         return (
//           evaluation.ten_khoa === khoaPhong &&
//           formatDate(timestamp) === selectedDot
//         );
//       });

//       setEvaluationExists(exists);
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Lỗi kiểm tra đánh giá');
//     }
//   };
//   useEffect(() => {
//     if (khoaPhong && selectedDot) {
//       checkExistingEvaluation();
//     }
//   }, [khoaPhong, selectedDot]);

//   // const fetchDataTieuChiTheoKhoa = async () => {
//   //   try {
//   //     let response = await fetch('http://172.16.0.60:883/api/phan_quyen');
//   //     let data = await response.json();

//   //     if (data && Array.isArray(data)) {
//   //       setApiTimestamp(data[0]?.thoi_gian_ghi_nhan);
//   //       const latestPhanQuyen = data[0]?.phan_quyen;

//   //       const khoaData = latestPhanQuyen?.find(
//   //         (item: any) => item.ten_khoa === khoaPhong,
//   //       );

//   //       if (khoaData && Array.isArray(khoaData.danh_sach_tieu_chi)) {
//   //         setDanhSachTieuChiTheoKhoa(khoaData.danh_sach_tieu_chi);
//   //         setLoadingDanhMuc(false);
//   //       } else {
//   //         setDanhSachTieuChiTheoKhoa([]);
//   //         setLoadingDanhMuc(false);
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //     messageApi.open({
//   //       type: 'error',
//   //       content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
//   //     });
//   //   }
//   // };

//   const fetchDataTieuChiTheoKhoa = async () => {
//     try {
//       let response = await fetch('http://172.16.0.60:883/api/phan_quyen');
//       let data = await response.json();

//       if (data && Array.isArray(data)) {
//         setApiTimestamp(data[0]?.thoi_gian_ghi_nhan);
//         const latestPhanQuyen = data[0]?.phan_quyen;

//         const khoaData = latestPhanQuyen?.find(
//           (item: any) => item.ten_khoa === khoaPhong,
//         );

//         if (khoaData && Array.isArray(khoaData.danh_sach_tieu_chi)) {
//           setDanhSachTieuChiTheoKhoa(khoaData.danh_sach_tieu_chi);
//           setFilteredTieuChi(khoaData.danh_sach_tieu_chi); // Also set filtered data
//           setLoadingDanhMuc(false);
//         } else {
//           setDanhSachTieuChiTheoKhoa([]);
//           setFilteredTieuChi([]);
//           setLoadingDanhMuc(false);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//       messageApi.open({
//         type: 'error',
//         content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
//       });
//       setLoadingDanhMuc(false);
//     }
//   };

//   useEffect(() => {
//     try {
//       const kiemTraDaDangNhapHayChua = async () => {
//         let token = localStorage.getItem('token');
//         if (!token) {
//           navigate('/dang-nhap');
//         }

//         let decodeDangNhap: any = await handleDecodeDangNhap(token);
//         setKhoaPhong(decodeDangNhap?.khoaphong);
//         setTenNhanVien(decodeDangNhap?.tennhanvien);
//       };
//       kiemTraDaDangNhapHayChua();
//     } catch (error) {
//       console.log(error);
//       messageApi.open({
//         type: 'error',
//         content: `Đã xảy ra lỗi trong quá trình kiểm tra đăng nhập`,
//       });
//     }
//   }, [khoaPhong]);

//   useEffect(() => {
//     const savedFiles = localStorage.getItem('uploadedFiles');
//     if (savedFiles) {
//       setFilesByTieuMucCon(JSON.parse(savedFiles));
//     }
//   }, []);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const seconds = String(date.getSeconds()).padStart(2, '0');

//     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
//   };

//   const layDanhSachDotTheoKhoa = async () => {
//     try {
//       const response = await axios.get('http://172.16.0.60:883/api/phan_quyen');
//       if (response.data) {
//         // Filter and transform the data
//         const dotTheoKhoa = response.data
//           .filter((item: any) => {
//             // Find if any phan_quyen entry matches the khoaPhong
//             return item.phan_quyen.some((pq: any) => pq.ten_khoa === khoaPhong);
//           })
//           .map((item: any) => ({
//             value: formatDate(item.thoi_gian_ghi_nhan),
//             label: formatDate(item.thoi_gian_ghi_nhan),
//           }));

//         setDanhSachDot(dotTheoKhoa);
//       }
//     } catch (error) {
//       messageApi.error('Lỗi khi tải danh sách đợt đánh giá');
//     }
//   };

//   useEffect(() => {
//     if (khoaPhong) {
//       layDanhSachDotTheoKhoa();
//     }
//   }, [khoaPhong, status]);

//   const handleDotChange = async (selectedOption: any) => {
//     const newDot = selectedOption?.value || '';
//     setSelectedDot(newDot);

//     // Đặt lại tất cả các state liên quan đến file ngay lập tức
//     setFileCounts({});
//     setStoredFiles({});

//     if (newDot) {
//       try {
//         // Lấy dữ liệu từ API phân quyền
//         const phanQuyenResponse = await axios.get(
//           'http://172.16.0.60:883/api/phan_quyen',
//         );

//         // Lấy dữ liệu đánh giá
//         const danhGiaResponse = await axios.get(
//           'http://172.16.0.60:883/api/danh_gia_khoa',
//         );

//         const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//           const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//           return (
//             formatDate(timestamp) === newDot && danhGia.ten_khoa === khoaPhong
//           );
//         });

//         // Tìm đợt đánh giá được chọn
//         const selectedPhanQuyen = phanQuyenResponse.data.find(
//           (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === newDot,
//         );

//         if (selectedPhanQuyen) {
//           // Tìm khoa phòng tương ứng
//           const khoaPhongData = selectedPhanQuyen.phan_quyen.find(
//             (pq: any) => pq.ten_khoa === khoaPhong,
//           );

//           if (khoaPhongData) {
//             // Cập nhật danh sách tiêu chí
//             setDanhSachTieuChiTheoKhoa(khoaPhongData.danh_sach_tieu_chi);
//           }
//         }

//         let shouldLockEvaluation = false;
//         const scores: Record<string, number> = {};
//         const notes: Record<string, string> = {};
//         const evaluators: Record<string, string> = {};

//         if (selectedEvaluation) {
//           // Đợt đánh giá đã tồn tại
//           setEvaluationExists(true);

//           // Lấy danh sách file đã tải lên cho đợt đánh giá này
//           const filesResponse = await axios.get(
//             'http://172.16.0.60:883/api/list_files',
//           );

//           // Lọc file theo đợt đánh giá một cách chính xác
//           const filesForThisEvaluation = filesResponse.data.filter(
//             (file: any) => file.id_dot_danh_gia === selectedEvaluation._id,
//           );

//           // Tạo đối tượng đếm số lượng file cho mỗi tiểu mục con
//           const counts: Record<string, number> = {};

//           // Tạo đối tượng lưu trữ thông tin file theo tiểu mục con
//           const filesByTieuMucCon: FilesByTieuMucCon = {};

//           // Chỉ xử lý nếu có file
//           if (filesForThisEvaluation && filesForThisEvaluation.length > 0) {
//             filesForThisEvaluation.forEach((file: any) => {
//               // Đếm số lượng file
//               counts[file.id_tieumuccon] =
//                 (counts[file.id_tieumuccon] || 0) + 1;

//               // Lưu thông tin file
//               if (!filesByTieuMucCon[file.id_tieumuccon]) {
//                 filesByTieuMucCon[file.id_tieumuccon] = [];
//               }

//               filesByTieuMucCon[file.id_tieumuccon].push({
//                 fileId: file.file_id,
//                 fileName: file.filename,
//                 id_tieumuccon: file.id_tieumuccon,
//               });
//             });
//           }

//           // Cập nhật state
//           setFileCounts(counts);
//           setStoredFiles(filesByTieuMucCon);

//           // Xử lý dữ liệu đánh giá
//           selectedEvaluation.danh_sach_danh_gia.forEach((danhGia: any) => {
//             danhGia.tieu_muc.forEach((tieuMuc: any) => {
//               if (tieuMuc.ghichu_danhgia) {
//                 const danhGiaPairs = tieuMuc.ghichu_danhgia.split(',');
//                 danhGiaPairs.forEach((pair: string) => {
//                   const [id, score] = pair.split(':');
//                   if (id && score) {
//                     scores[id] = parseInt(score);
//                   }
//                 });
//               }
//               if (tieuMuc.danh_gia === 10 || tieuMuc.danh_gia === 11) {
//                 shouldLockEvaluation = true;
//               }
//               if (tieuMuc.mota_danhgia) {
//                 const moTaPairs = tieuMuc.mota_danhgia.split(',');
//                 moTaPairs.forEach((pair: string) => {
//                   const [id, note] = pair.split(':');
//                   if (id && note) {
//                     notes[id] = note === 'none' ? '' : note || '';
//                   }
//                 });
//               }

//               if (tieuMuc.nguoi_danhgia) {
//                 const evaluatorPairs = tieuMuc.nguoi_danhgia.split(',');
//                 evaluatorPairs.forEach((pair: string) => {
//                   const [id, name] = pair.split(':');
//                   if (id && name) {
//                     evaluators[id] = name === 'none' ? '' : name || '';
//                   }
//                 });
//               }
//             });
//           });
//         } else {
//           // Đợt đánh giá chưa tồn tại, đặt lại tất cả các giá trị
//           setEvaluationExists(false);
//         }

//         setEvaluatorNames(evaluators);
//         setIsEvaluationLocked(shouldLockEvaluation);
//         setEvaluationScores(scores);
//         setEvaluationNotes(notes);

//         // Xóa dữ liệu file trong localStorage để tránh xung đột
//         localStorage.removeItem('storedFiles');
//         localStorage.removeItem('uploadedFiles');
//       } catch (error) {
//         console.error(error);
//         messageApi.error('Đã có lỗi xảy ra khi tải dữ liệu');
//       }
//     } else {
//       setDanhSachTieuChiTheoKhoa([]);
//       setEvaluationScores({});
//       setEvaluationNotes({});
//     }
//   };

//   const tx = document.getElementsByTagName('textarea');
//   for (let i = 0; i < tx.length; i++) {
//     tx[i].style.height = tx[i].scrollHeight + 'px';
//     tx[i].style.overflowY = 'hidden';
//     tx[i].addEventListener('input', OnInput, false);
//   }

//   function OnInput(this: HTMLTextAreaElement) {
//     this.style.height = 'auto';
//     this.style.height = this.scrollHeight + 'px';
//   }

//   const handleEvaluationChange = (id_tieumuccon: string, value: number) => {
//     setEvaluationScores((prev) => ({
//       ...prev,
//       [id_tieumuccon]: value,
//     }));
//   };

//   const printReport = async () => {
//     try {
//       // Fetch evaluation data
//       const response = await DanhSachDanhGia();

//       const selectedEvaluation = response.find((danhGia: any) => {
//         const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//         return formatDate(timestamp) === selectedDot;
//       });

//       if (!selectedEvaluation) {
//         messageApi.error('Không tìm thấy dữ liệu đánh giá cho đợt này');
//         return;
//       }

//       // Calculate statistics at the tiêu chí level
//       let totalCriteria = 0;
//       let passedCriteria = 0;

//       // Prepare data for tiêu chí evaluation
//       const tieuChiEvaluations = danhSachTieuChiTheoKhoa.map((tieuChi) => {
//         totalCriteria++;

//         // Check if all tiểu mục con in this tiêu chí are passed
//         let allTieuMucConPassed = true;
//         let totalTieuMucCon = 0;
//         let passedTieuMucCon = 0;

//         tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
//           if (tieuMuc.hidden === 0 && tieuMuc.cac_tieu_muc_con) {
//             tieuMuc.cac_tieu_muc_con.forEach((tieuMucCon) => {
//               if (tieuMucCon.hidden === 0) {
//                 totalTieuMucCon++;
//                 if (evaluationScores[tieuMucCon.id_tieumuccon] === 1) {
//                   passedTieuMucCon++;
//                 } else {
//                   allTieuMucConPassed = false;
//                 }
//               }
//             });
//           }
//         });

//         // If all tiểu mục con are passed, the tiêu chí is passed
//         if (allTieuMucConPassed && totalTieuMucCon > 0) {
//           passedCriteria++;
//         }

//         return {
//           id: tieuChi.id_tieuchi,
//           so_tieuchi: tieuChi.so_tieuchi,
//           ten_tieuchi: tieuChi.ten_tieuchi,
//           mo_ta: tieuChi.mo_ta,
//           isPassed: allTieuMucConPassed && totalTieuMucCon > 0,
//           totalTieuMucCon,
//           passedTieuMucCon,
//         };
//       });

//       const failedCriteria = totalCriteria - passedCriteria;
//       const completionRate =
//         totalCriteria > 0 ? (passedCriteria / totalCriteria) * 100 : 0;
//       const completionRateFormatted = completionRate.toFixed(1);

//       // Generate table rows for tiêu chí details only
//       let tableRows = '';

//       tieuChiEvaluations.forEach((tieuChi) => {
//         const isPass = tieuChi.isPassed;
//         const statusBadge = isPass
//           ? `<span class="status-badge passed-badge"><i class="fas fa-check"></i> Đạt</span>`
//           : `<span class="status-badge failed-badge"><i class="fas fa-times"></i> Không đạt</span>`;

//         // Calculate completion rate for this tiêu chí
//         // const tieuChiCompletionRate =
//         //   tieuChi.totalTieuMucCon > 0
//         //     ? Math.round(
//         //         (tieuChi.passedTieuMucCon / tieuChi.totalTieuMucCon) * 100,
//         //       )
//         //     : 0;

//         // const attachmentInfo = `<i class="fas fa-tasks"></i> ${tieuChi.passedTieuMucCon}/${tieuChi.totalTieuMucCon} tiểu mục con (${tieuChiCompletionRate}%)`;

//         tableRows += `
//           <tr>
//             <td>${tieuChi.so_tieuchi}</td>
//             <td>
//               <strong>${tieuChi.ten_tieuchi}</strong>
//               <p>${tieuChi.mo_ta || ''}</p>
//             </td>
//             <td>${statusBadge}</td>

//           </tr>
//         `;
//       });

//       // Generate recommendations based on failed criteria
//       let recommendations = '';
//       if (failedCriteria > 0) {
//         recommendations =
//           '<p><i class="fas fa-exclamation-circle"></i> Cần cải thiện các tiêu chí chưa đạt.</p>';

//         // Add specific recommendations for failed criteria
//         tieuChiEvaluations.forEach((tieuChi) => {
//           if (!tieuChi.isPassed) {
//             recommendations += `<p><i class="fas fa-wrench"></i> TC-${tieuChi.so_tieuchi}: Cần hoàn thiện các tiểu mục con trong tiêu chí "${tieuChi.ten_tieuchi}"</p>`;
//           }
//         });
//       } else {
//         recommendations =
//           '<p><i class="fas fa-check-circle"></i> Tất cả tiêu chí đều đạt yêu cầu. Tiếp tục duy trì chất lượng.</p>';
//       }

//       // Get date range from selectedDot with time information
//       const dateParts = selectedDot.split(' ')[0].split('/');
//       const timeParts = selectedDot.split(' ')[1].split(':');

//       // Create date object with full date and time information
//       const dateObj = new Date(
//         parseInt(dateParts[2]), // year
//         parseInt(dateParts[1]) - 1, // month (0-based)
//         parseInt(dateParts[0]), // day
//         parseInt(timeParts[0]), // hours
//         parseInt(timeParts[1]), // minutes
//         parseInt(timeParts[2]), // seconds
//       );

//       const endDate = new Date(dateObj);
//       endDate.setMonth(endDate.getMonth() + 6);

//       const formatDateTimeString = (date: Date) => {
//         return `${String(date.getDate()).padStart(2, '0')}/${String(
//           date.getMonth() + 1,
//         ).padStart(2, '0')}/${date.getFullYear()} ${String(
//           date.getHours(),
//         ).padStart(2, '0')}:${String(date.getMinutes()).padStart(
//           2,
//           '0',
//         )}:${String(date.getSeconds()).padStart(2, '0')}`;
//       };

//       const dateRange = `${formatDateTimeString(dateObj)}`;

//       const printContent = `
//       <!DOCTYPE html>
//       <html lang="vi">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Báo cáo Đánh giá Chất lượng</title>
//           <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
//           <style>
//               :root {
//                   --primary-blue: #002244;
//                   --secondary-blue: #005B96;
//                   --accent-blue: #e6f0ff;
//                   --passed: #2E8B57;
//                   --failed: #FFA500;
//               }

//               body {
//                   font-family: 'Arial', sans-serif;
//                   line-height: 1.6;
//                   margin: 2rem;
//                   background-color: #f8f9fa;
//               }

//               .report-container {
//                   max-width: 1200px;
//                   margin: 0 auto;
//                   background: white;
//                   padding: 2rem;
//                   border-radius: 15px;
//                   box-shadow: 0 4px 20px rgba(0,0,0,0.1);
//               }

//               .header {
//                   text-align: center;
//                   border-bottom: 3px solid var(--primary-blue);
//                   padding-bottom: 1rem;
//                   margin-bottom: 2rem;
//               }

//               .header h1 {
//                   color: var(--primary-blue);
//                   font-size: 2.5rem;
//                   margin: 0.5rem 0;
//               }

//               .overview-cards {
//                   display: grid;
//                   grid-template-columns: repeat(3, 1fr);
//                   gap: 1.5rem;
//                   margin-bottom: 2rem;
//               }

//               .card {
//                   background: var(--accent-blue);
//                   padding: 1.5rem;
//                   border-radius: 10px;
//                   text-align: center;
//               }

//               .card i {
//                   font-size: 2rem;
//                   color: var(--secondary-blue);
//                   margin-bottom: 1rem;
//               }

//               .status-badge {
//                   display: inline-block;
//                   padding: 0.3rem 0.8rem;
//                   border-radius: 20px;
//                   font-weight: bold;
//               }

//               .passed-badge {
//                   background: var(--passed);
//                   color: white;
//               }

//               .failed-badge {
//                   background: var(--failed);
//                   color: white;
//               }

//               table {
//                   width: 100%;
//                   border-collapse: collapse;
//                   margin: 2rem 0;
//               }

//               th {
//                   background: var(--primary-blue);
//                   color: white;
//                   padding: 1rem;
//                   text-align: left;
//               }

//               td {
//                   padding: 1rem;
//                   border-bottom: 1px solid #ddd;
//               }

//               tr:hover {
//                   background-color: #f5f5f5;
//               }

//               .progress-bar {
//                   width: 100%;
//                   height: 20px;
//                   background: #ddd;
//                   border-radius: 10px;
//                   overflow: hidden;
//               }

//               .progress-fill {
//                   height: 100%;
//                   background: var(--secondary-blue);
//                   width: ${completionRate}%;
//                   transition: width 0.5s ease;
//               }

//               .recommendation-box {
//                   background: var(--accent-blue);
//                   padding: 1.5rem;
//                   border-left: 4px solid var(--secondary-blue);
//                   margin: 1rem 0;
//               }

//               @media print {
//                   body {
//                       padding: 0;
//                       background: white;
//                   }

//                   .report-container {
//                       box-shadow: none;
//                   }
//               }
//           </style>
//       </head>
//       <body>
//           <div class="report-container">
//               <div class="header">
//                   <h1><i class="fas fa-hospital"></i> Báo cáo Đánh giá Chất lượng</h1>
//                   <div class="meta-info">
//                       <p><i class="fas fa-clipboard-list"></i> Khoa/Phòng: ${khoaPhong}</p>
//                       <p><i class="fas fa-calendar-alt"></i> Thời gian: ${dateRange}</p>
//                   </div>
//               </div>

//               <div class="overview-cards">
//                   <div class="card">
//                       <i class="fas fa-check-circle"></i>
//                       <h3>Tiêu chí đạt</h3>
//                       <p class="stat-number">${passedCriteria}/${totalCriteria}</p>
//                   </div>

//                   <div class="card">
//                       <i class="fas fa-exclamation-triangle"></i>
//                       <h3>Tiêu chí không đạt</h3>
//                       <p class="stat-number">${failedCriteria}</p>
//                   </div>

//                   <div class="card">
//                       <i class="fas fa-chart-line"></i>
//                       <h3>Tỷ lệ hoàn thành</h3>
//                       <p class="stat-number">${completionRateFormatted}%</p>
//                   </div>
//               </div>

//               <div class="progress-bar">
//                   <div class="progress-fill"></div>
//               </div>

//               <h2><i class="fas fa-list-ul"></i> Chi tiết tiêu chí</h2>
//               <table>
//                   <thead>
//                       <tr>
//                           <th>Tiêu chí</th>
//                           <th>Nội dung</th>
//                           <th>Trạng thái</th>

//                       </tr>
//                   </thead>
//                   <tbody>
//                       ${tableRows}
//                   </tbody>
//               </table>

//           </div>
//       </body>
//       </html>
//       `;

//       const printWindow = window.open('', '', 'height=600,width=800');
//       if (printWindow) {
//         printWindow.document.write(printContent);
//         printWindow.document.close();

//         // Wait for resources to load before printing
//         setTimeout(() => {
//           printWindow.print();
//         }, 1000);
//       } else {
//         messageApi.error(
//           'Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt của bạn.',
//         );
//       }
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Đã có lỗi xảy ra khi tạo báo cáo');
//     }
//   };

//   function convertToGMTString(dateStr: string) {
//     // Split date and time
//     const [datePart, timePart] = dateStr.split(' ');
//     const [day, month, year] = datePart.split('/');
//     const [hours, minutes, seconds] = timePart.split(':');

//     // Create Date object
//     const date = new Date(
//       Number(year),
//       Number(month) - 1, // Month is 0-based
//       Number(day),
//       Number(hours),
//       Number(minutes),
//       Number(seconds),
//     );

//     // Convert to GMT string
//     return date.toUTCString();
//   }

//   const handleNoteChange = (id_tieumuccon: string, value: string) => {
//     setEvaluationNotes((prev) => ({
//       ...prev,
//       [id_tieumuccon]: value,
//     }));
//   };

//   const luuChoDanhGiaMoi = async () => {
//     try {
//       // const apiDate = new Date(apiTimestamp);

//       const evaluationData = {
//         danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
//           id_tieuchi: tieuChi.id_tieuchi,
//           tieu_muc: tieuChi.cac_tieu_muc
//             .filter((tm) => tm.hidden === 0)
//             .filter(
//               (tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0,
//             )
//             .map((tieuMuc) => {
//               const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc) => tmc.hidden === 0)
//                 ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

//               const danhGiaTieuMucConString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map(
//                   (tmc: any) =>
//                     `${tmc.id_tieumuccon}:${
//                       evaluationScores[tmc.id_tieumuccon] || 0
//                     }`,
//                 )
//                 .join(',');

//               const danhGiaVaGhiChuString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map((tmc: any) => {
//                   const ghiChu = evaluationNotes[tmc.id_tieumuccon] || 'none';
//                   return `${tmc.id_tieumuccon}:${ghiChu}`;
//                 })
//                 .join(',');

//               const evaluatorNamesString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map((tmc: any) => {
//                   const evaluatorName =
//                     evaluatorNames[tmc.id_tieumuccon] || 'none';
//                   return `${tmc.id_tieumuccon}:${evaluatorName}`;
//                 })
//                 .join(',');

//               return {
//                 id_tieumuc: tieuMuc.id_tieumuc,
//                 danh_gia: allTieuMucConDat ? 1 : 0,
//                 ghichu_danhgia: danhGiaTieuMucConString,
//                 mota_danhgia: danhGiaVaGhiChuString,
//                 // nguoi_danhgia: evaluatorNamesString,
//               };
//             }),
//         })),

//         ten_khoa: khoaPhong,
//         nhan_vien: `${tenNhanVien}-${convertToGMTString(selectedDot)}`,
//       };

//       const response = await axios.post(
//         'http://172.16.0.60:883/api/danh_gia_khoa',
//         evaluationData,
//       );

//       // Get the ID of the newly created evaluation
//       const newEvaluationId = response.data._id;

//       // Log each tiêu chí and tiêu mục evaluation
//       const logPromises = danhSachTieuChiTheoKhoa.flatMap((tieuChi) =>
//         tieuChi.cac_tieu_muc
//           .filter((tm) => tm.hidden === 0)
//           .filter((tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0)
//           .map((tieuMuc) => {
//             return axios.post('http://172.16.0.60:883/api/log_danh_gia', {
//               hanh_dong: 'danh_gia',
//               id_danh_gia: newEvaluationId,
//               id_tieuchi: tieuChi.id_tieuchi,
//               id_tieumuc: tieuMuc.id_tieumuc,
//               nguoi_thuc_hien: tenNhanVien,
//               ten_khoa: khoaPhong,
//               ten_tieuchi: tieuChi.ten_tieuchi,
//               ten_tieumuc: tieuMuc.ten_tieu_muc,
//             });
//           }),
//       );

//       await Promise.all(logPromises);

//       setStatus(randomString());

//       messageApi.success('Thêm đánh giá cho đợt mới thành công');
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
//     }
//   };

//   const luuChoDanhGiaNay = async () => {
//     try {
//       const evaluationsResponse = await DanhSachDanhGia();
//       const selectedEvaluation = evaluationsResponse.find((evaluation: any) => {
//         const timestamp = evaluation.nhan_vien.split('-')[1]?.trim();
//         return formatDate(timestamp) === selectedDot;
//       });

//       if (!selectedEvaluation) {
//         messageApi.error('Không tìm thấy đợt đánh giá');
//         return;
//       }

//       const updatePromises = danhSachTieuChiTheoKhoa
//         .flatMap((tieuChi) =>
//           tieuChi.cac_tieu_muc
//             .filter((tm) => tm.hidden === 0)
//             .filter(
//               (tm) => tm.cac_tieu_muc_con && tm.cac_tieu_muc_con.length > 0,
//             )
//             .map((tieuMuc) => {
//               const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc) => tmc.hidden === 0)
//                 ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

//               const danhGiaTieuMucConString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map(
//                   (tmc: any) =>
//                     `${tmc.id_tieumuccon}:${
//                       evaluationScores[tmc.id_tieumuccon] || 0
//                     }`,
//                 )
//                 .join(',');

//               const danhGiaVaGhiChuString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map((tmc: any) => {
//                   const ghiChu = evaluationNotes[tmc.id_tieumuccon] || 'none';
//                   return `${tmc.id_tieumuccon}:${ghiChu}`;
//                 })
//                 .join(',');

//               const evaluatorNamesString = tieuMuc.cac_tieu_muc_con
//                 ?.filter((tmc: any) => tmc.hidden === 0)
//                 ?.map((tmc: any) => {
//                   const evaluatorName =
//                     evaluatorNames[tmc.id_tieumuccon] || 'none';
//                   return `${tmc.id_tieumuccon}:${evaluatorName}`;
//                 })
//                 .join(',');

//               // return axios.put(
//               //   'http://172.16.0.60:883/api/cap_nhat_danh_gia_tieu_muc',
//               //   {
//               //     id_danh_gia: selectedEvaluation._id,
//               //     id_tieuchi: tieuChi.id_tieuchi,
//               //     id_tieumuc: tieuMuc.id_tieumuc,
//               //     danh_gia: allTieuMucConDat ? 1 : 0,
//               //     ghichu_danhgia: danhGiaTieuMucConString,
//               //     mota_danhgia: danhGiaVaGhiChuString,
//               //     // nguoi_danhgia: evaluatorNamesString,
//               //   },
//               // );

//               // Create update promise for evaluation
//               const updatePromise = axios.put(
//                 'http://172.16.0.60:883/api/cap_nhat_danh_gia_tieu_muc',
//                 {
//                   id_danh_gia: selectedEvaluation._id,
//                   id_tieuchi: tieuChi.id_tieuchi,
//                   id_tieumuc: tieuMuc.id_tieumuc,
//                   danh_gia: allTieuMucConDat ? 1 : 0,
//                   ghichu_danhgia: danhGiaTieuMucConString,
//                   mota_danhgia: danhGiaVaGhiChuString,
//                   // nguoi_danhgia: evaluatorNamesString,
//                 },
//               );

//               // Create log promise
//               const logPromise = axios.post(
//                 'http://172.16.0.60:883/api/log_danh_gia',
//                 {
//                   hanh_dong: 'danh_gia',
//                   id_danh_gia: selectedEvaluation._id,
//                   id_tieuchi: tieuChi.id_tieuchi,
//                   id_tieumuc: tieuMuc.id_tieumuc,
//                   nguoi_thuc_hien: tenNhanVien,
//                   ten_khoa: khoaPhong,
//                   ten_tieuchi: tieuChi.ten_tieuchi,
//                   ten_tieumuc: tieuMuc.ten_tieu_muc,
//                 },
//               );

//               // Return both promises
//               return [updatePromise, logPromise];
//             }),
//         )
//         .flat();

//       await Promise.all(updatePromises);
//       setStatus(randomString());
//       messageApi.success('Cập nhật đánh giá thành công');
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Đã có lỗi xảy ra khi cập nhật đánh giá');
//     }
//   };

//   useEffect(() => {
//     const savedFiles = localStorage.getItem('storedFiles');
//     if (savedFiles) {
//       setStoredFiles(JSON.parse(savedFiles));
//     }
//   }, []);

//   const randomString = (length = 8) => {
//     const chars =
//       'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//       result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
//   };

//   const handleSave = () => {
//     if (evaluationExists) {
//       luuChoDanhGiaNay();
//     } else {
//       luuChoDanhGiaMoi();
//     }
//   };

//   // const handleFileUpload = async (
//   //   e: React.ChangeEvent<HTMLInputElement>,
//   //   id_tieumuccon: string,
//   // ) => {
//   //   const files = e.target.files;
//   //   if (!files || files.length === 0) return;

//   //   try {
//   //     const existingFilesResponse = await axios.get(
//   //       'http://172.16.0.60:883/api/list_files',
//   //     );

//   //     // const phanQuyenResponse = await axios.get(
//   //     //   'http://172.16.0.60:883/api/phan_quyen',
//   //     // );

//   //     const danhGiaResponse = await axios.get(
//   //       'http://172.16.0.60:883/api/danh_gia_khoa',
//   //     );

//   //     // const selectedPhanQuyen = phanQuyenResponse.data.find(
//   //     //   (pq: any) => formatDate(pq.thoi_gian_ghi_nhan) === selectedDot,
//   //     // );

//   //     const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//   //       const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//   //       return formatDate(timestamp) === selectedDot;
//   //     });

//   //     const id_dot_danh_gia = selectedEvaluation._id;

//   //     const existingFiles = existingFilesResponse.data.filter(
//   //       (file: any) => file.id_tieumuccon === id_tieumuccon,
//   //     );

//   //     for (let i = 0; i < files.length; i++) {
//   //       const isDuplicate = existingFiles.some(
//   //         (existingFile: any) => existingFile.filename === files[i].name,
//   //       );

//   //       if (isDuplicate) {
//   //         messageApi.warning(
//   //           `File "${files[i].name}" đã được tải lên trong tiểu mục con này`,
//   //         );
//   //         e.target.value = '';
//   //         return;
//   //       }

//   //       const formData = new FormData();
//   //       formData.append('file', files[i]);

//   //       await fetch(
//   //         `http://172.16.0.60:883/api/upload_file/${id_dot_danh_gia}/${id_tieumuccon}`,
//   //         {
//   //           method: 'POST',
//   //           body: formData,
//   //         },
//   //       );
//   //     }

//   //     setStatus(randomString());
//   //     messageApi.success('Tải file lên thành công');
//   //     e.target.value = '';
//   //   } catch (error) {
//   //     console.error(error);
//   //     e.target.value = '';
//   //     messageApi.error('Lỗi khi tải file lên');
//   //   }
//   // };

//   const handleFileUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//     id_tieumuccon: string,
//   ) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     try {
//       // Get all existing files
//       const existingFilesResponse = await axios.get(
//         'http://172.16.0.60:883/api/list_files',
//       );

//       // Get the current evaluation data
//       const danhGiaResponse = await axios.get(
//         'http://172.16.0.60:883/api/danh_gia_khoa',
//       );

//       // Find the selected evaluation for this department and period
//       const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//         const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//         return (
//           formatDate(timestamp) === selectedDot &&
//           danhGia.ten_khoa === khoaPhong
//         );
//       });

//       if (!selectedEvaluation) {
//         messageApi.error('Không tìm thấy đợt đánh giá hiện tại');
//         e.target.value = '';
//         return;
//       }

//       const id_dot_danh_gia = selectedEvaluation._id;

//       // Get all files for this department and evaluation period
//       const departmentFiles = existingFilesResponse.data.filter(
//         (file: any) => file.id_dot_danh_gia === id_dot_danh_gia,
//       );

//       // Check each file for duplicates across all tieuMucCon in this evaluation
//       for (let i = 0; i < files.length; i++) {
//         const isDuplicate = departmentFiles.some(
//           (existingFile: any) => existingFile.filename === files[i].name,
//         );

//         if (isDuplicate) {
//           messageApi.warning(
//             `File "${files[i].name}" đã được tải lên trong đợt đánh giá này của khoa phòng ${khoaPhong}`,
//           );
//           e.target.value = '';
//           return;
//         }

//         const formData = new FormData();
//         formData.append('file', files[i]);

//         await fetch(
//           `http://172.16.0.60:883/api/upload_file/${id_dot_danh_gia}/${id_tieumuccon}`,
//           {
//             method: 'POST',
//             body: formData,
//           },
//         );
//       }

//       setStatus(randomString());
//       messageApi.success('Tải file lên thành công');
//       e.target.value = '';
//     } catch (error) {
//       console.error(error);
//       e.target.value = '';
//       messageApi.error('Lỗi khi tải file lên');
//     }
//   };

//   // const handleFileUpload = async (
//   //   e: React.ChangeEvent<HTMLInputElement>,
//   //   id_tieumuccon: string,
//   // ) => {
//   //   const files = e.target.files;
//   //   if (!files || files.length === 0) return;

//   //   try {
//   //     // Lấy tất cả các file hiện có
//   //     const existingFilesResponse = await axios.get(
//   //       'http://172.16.0.60:883/api/list_files',
//   //     );

//   //     // Lấy dữ liệu đánh giá hiện tại
//   //     const danhGiaResponse = await axios.get(
//   //       'http://172.16.0.60:883/api/danh_gia_khoa',
//   //     );

//   //     // Tìm đánh giá cụ thể cho khoa phòng HIỆN TẠI và đợt đánh giá đã chọn
//   //     // Điều này đảm bảo chúng ta đang làm việc với đánh giá của đúng khoa phòng
//   //     const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//   //       const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//   //       return (
//   //         formatDate(timestamp) === selectedDot &&
//   //         danhGia.ten_khoa === khoaPhong // Đảm bảo sử dụng khoa phòng của người dùng đã đăng nhập
//   //       );
//   //     });

//   //     if (!selectedEvaluation) {
//   //       messageApi.error(
//   //         'Không tìm thấy đợt đánh giá hiện tại cho khoa phòng của bạn',
//   //       );
//   //       e.target.value = '';
//   //       return;
//   //     }

//   //     const id_dot_danh_gia = selectedEvaluation._id;

//   //     // Lấy các file cho khoa phòng và đợt đánh giá cụ thể này
//   //     const departmentFiles = existingFilesResponse.data.filter(
//   //       (file: any) => file.id_dot_danh_gia === id_dot_danh_gia,
//   //     );

//   //     // Kiểm tra từng file có trùng lặp trong đánh giá của khoa phòng này không
//   //     for (let i = 0; i < files.length; i++) {
//   //       const isDuplicate = departmentFiles.some(
//   //         (existingFile: any) => existingFile.filename === files[i].name,
//   //       );

//   //       if (isDuplicate) {
//   //         messageApi.warning(
//   //           `File "${files[i].name}" đã được tải lên trong đợt đánh giá này của khoa phòng ${khoaPhong}`,
//   //         );
//   //         e.target.value = '';
//   //         return;
//   //       }

//   //       const formData = new FormData();
//   //       formData.append('file', files[i]);

//   //       // Tải lên cho đánh giá của khoa phòng cụ thể
//   //       await fetch(
//   //         `http://172.16.0.60:883/api/upload_file/${id_dot_danh_gia}/${id_tieumuccon}`,
//   //         {
//   //           method: 'POST',
//   //           body: formData,
//   //         },
//   //       );
//   //     }

//   //     setStatus(randomString());
//   //     messageApi.success('Tải file lên thành công');
//   //     e.target.value = '';
//   //   } catch (error) {
//   //     console.error(error);
//   //     e.target.value = '';
//   //     messageApi.error('Lỗi khi tải file lên');
//   //   }
//   // };

//   const handleDeleteFile = async (id_tieumuccon: string, fileId: string) => {
//     try {
//       const response = await axios.delete(
//         `http://172.16.0.60:883/api/delete_file/${fileId}`,
//       );

//       if (response.status === 200) {
//         const newFiles = storedFiles[id_tieumuccon].filter(
//           (file) => file.fileId !== fileId,
//         );

//         const newStoredFiles = {
//           ...storedFiles,
//           [id_tieumuccon]: newFiles,
//         };

//         setStoredFiles(newStoredFiles);
//         setStatus(randomString());
//         messageApi.success('Xóa file thành công');
//       }
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Lỗi khi xóa file');
//     }
//   };

//   //main// const showFileList = async (id_tieumuccon: string) => {
//   //   try {
//   //     if (!selectedDot) {
//   //       messageApi.warning('Vui lòng chọn đợt đánh giá trước');
//   //       return;
//   //     }

//   //     const danhGiaResponse = await axios.get(
//   //       'http://172.16.0.60:883/api/danh_gia_khoa',
//   //     );

//   //     const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//   //       const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//   //       return (
//   //         formatDate(timestamp) === selectedDot &&
//   //         danhGia.ten_khoa === khoaPhong
//   //       );
//   //     });

//   //     if (!selectedEvaluation) {
//   //       // messageApi.info('Không có dữ liệu đánh giá cho đợt này');
//   //       setStoredFiles({});
//   //       setSelectedTieuMucCon('');
//   //       setIsModalVisible(true);
//   //       return;
//   //     }

//   //     const id_dot_danh_gia = selectedEvaluation._id;

//   //     const response = await axios.get('http://172.16.0.60:883/api/list_files');
//   //     const filteredFiles = response.data.filter(
//   //       (file: any) =>
//   //         file.id_dot_danh_gia === id_dot_danh_gia &&
//   //         file.id_tieumuccon === id_tieumuccon,
//   //     );

//   //     if (filteredFiles.length === 0) {
//   //       messageApi.info('Không có file nào được tải lên cho tiểu mục con này');
//   //       setStoredFiles({
//   //         [id_tieumuccon]: [],
//   //       });
//   //     } else {
//   //       setStoredFiles({
//   //         [id_tieumuccon]: filteredFiles.map((file: any) => ({
//   //           fileId: file.file_id,
//   //           fileName: file.filename,
//   //           id_tieumuccon: file.id_tieumuccon,
//   //         })),
//   //       });
//   //     }

//   //     setSelectedTieuMucCon(id_tieumuccon);
//   //     setIsModalVisible(true);
//   //   } catch (error) {
//   //     console.error(error);
//   //     messageApi.error('Lỗi khi tải danh sách file');
//   //   }
//   // };

//   const showFileList = async (id_tieumuccon: string) => {
//     try {
//       if (!selectedDot) {
//         messageApi.warning('Vui lòng chọn đợt đánh giá trước');
//         return;
//       }

//       const danhGiaResponse = await axios.get(
//         'http://172.16.0.60:883/api/danh_gia_khoa',
//       );

//       // Tìm đánh giá cụ thể cho khoa phòng HIỆN TẠI và đợt đánh giá đã chọn
//       const selectedEvaluation = danhGiaResponse.data.find((danhGia: any) => {
//         const timestamp = danhGia.nhan_vien.split('-')[1]?.trim();
//         return (
//           formatDate(timestamp) === selectedDot &&
//           danhGia.ten_khoa === khoaPhong // Đảm bảo lọc theo khoa phòng hiện tại
//         );
//       });

//       if (!selectedEvaluation) {
//         setStoredFiles({});
//         setSelectedTieuMucCon('');
//         setIsModalVisible(true);
//         return;
//       }

//       const id_dot_danh_gia = selectedEvaluation._id;

//       const response = await axios.get('http://172.16.0.60:883/api/list_files');

//       // Lọc file theo đợt đánh giá và tiểu mục con CỦA KHOA PHÒNG HIỆN TẠI
//       const filteredFiles = response.data.filter(
//         (file: any) =>
//           file.id_dot_danh_gia === id_dot_danh_gia &&
//           file.id_tieumuccon === id_tieumuccon,
//       );

//       if (filteredFiles.length === 0) {
//         // messageApi.info('Không có file nào được tải lên cho tiểu mục con này');
//         setStoredFiles({
//           [id_tieumuccon]: [],
//         });
//       } else {
//         setStoredFiles({
//           [id_tieumuccon]: filteredFiles.map((file: any) => ({
//             fileId: file.file_id,
//             fileName: file.filename,
//             id_tieumuccon: file.id_tieumuccon,
//           })),
//         });
//       }

//       setSelectedTieuMucCon(id_tieumuccon);
//       setIsModalVisible(true);
//     } catch (error) {
//       console.error(error);
//       messageApi.error('Lỗi khi tải danh sách file');
//     }
//   };

//   return (
//     <>
//       {contextHolder}
//       {khoaPhong !== 'Phòng Quản Lý chất lượng' ? (
//         <>
//           <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-xl sm:text-2xl font-bold mb-4">
//               Đánh giá tiêu chí {khoaPhong}
//             </div>
//             <br />
//             <div className="w-full mb-6">
//               <Select
//                 isDisabled={false}
//                 value={
//                   selectedDot
//                     ? {
//                         value: selectedDot,
//                         label: selectedDot,
//                       }
//                     : null
//                 }
//                 options={danhSachDot.map((dot: any) => ({
//                   value: dot.value,
//                   label: dot.label,
//                 }))}
//                 placeholder="Chọn đợt"
//                 isClearable={true}
//                 onChange={handleDotChange}
//                 className="w-full sm:w-1/2 mb-4"
//               />
//               {/* Add search input */}
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Tìm kiếm tiêu chí, tiểu mục, tiểu mục con..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   className="w-full sm:w-1/2 p-2 border rounded"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="bg-primary h-full px-3 pt-3 pb-3 text-white sm:right-1/2 sm:mr-8"
//                   >
//                     Đặt lại
//                   </button>
//                 )}
//               </div>
//             </div>
//             <br />

//             {selectedDot && (
//               <>
//                 <div className="flex flex-col sm:flex-row gap-2 mb-6">
//                   <button
//                     title={
//                       isEvaluationLocked
//                         ? `Không thể lưu do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                         : `Lưu đánh giá`
//                     }
//                     className={`w-full sm:w-auto bg-primary p-2 text-gray font-medium hover:bg-opacity-90 ${
//                       isEvaluationLocked ? 'opacity-50 cursor-not-allowed' : ''
//                     }`}
//                     onClick={handleSave}
//                     disabled={isEvaluationLocked}
//                   >
//                     Lưu thông tin
//                   </button>

//                   <button
//                     title="In báo cáo"
//                     className="w-full sm:w-auto bg-success p-2 text-gray font-medium hover:bg-opacity-90"
//                     onClick={printReport}
//                   >
//                     In báo cáo
//                   </button>
//                 </div>

//                 <br />
//                 <h1 className="font-bold mb-4">Danh mục của {khoaPhong}</h1>
//                 <div id="form-container">
//                   <div id="levels-container">
//                     {/* {loadingDanhMuc === false ? (
//                       <>
//                         {danhSachTieuChiTheoKhoa &&
//                         Array.isArray(danhSachTieuChiTheoKhoa) &&
//                         danhSachTieuChiTheoKhoa.length > 0 ? (
//                           danhSachTieuChiTheoKhoa
//                             .filter((tc) => tc.hidden === 0)
//                             .map((existingData) => {
//                               const level1Id = existingData.so_tieuchi;

//                               return (
//                                 <div
//                                   key={`level-1-${level1Id}`}
//                                   className="level"
//                                   id={`level-1-${level1Id}`}
//                                 >
//                                   <h3 className="text-danger font-bold">
//                                     Tiêu chí - {level1Id}
//                                   </h3>

//                                   <div className="flex flex-col sm:flex-row gap-2 mb-4">
//                                     <input
//                                       className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                       type="text"
//                                       placeholder="Số"
//                                       value={level1Id}
//                                       readOnly
//                                     />

//                                     <input
//                                       type="text"
//                                       className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                       placeholder="Tên Tiêu chí"
//                                       id={`ten-tieuchi-cap1-${level1Id}`}
//                                       defaultValue={
//                                         existingData?.ten_tieuchi || ''
//                                       }
//                                       readOnly
//                                     />
//                                     <textarea
//                                       id={`noidung-tieuchi-cap1-${level1Id}`}
//                                       className="w-full sm:w-9/12 p-2 border rounded"
//                                       defaultValue={existingData?.mo_ta || ''}
//                                       rows={2}

//                                       placeholder="Nội dung Tiêu chí"
//                                       readOnly
//                                     ></textarea>
//                                   </div>

//                                   {existingData?.cac_tieu_muc &&
//                                     Array.isArray(existingData?.cac_tieu_muc) &&
//                                     existingData?.cac_tieu_muc
//                                       .filter((item) => item.hidden === 0)
//                                       .map((item, level2Index) => {
//                                         const level2Id = level2Index + 1;

//                                         const existingDataTieuMuc =
//                                           existingData?.cac_tieu_muc.find(
//                                             (tc) =>
//                                               tc.so_tieu_muc ===
//                                                 item?.so_tieu_muc &&
//                                               tc.hidden === 0,
//                                           );

//                                         return (
//                                           <>
//                                             <div
//                                               key={`${level1Id}-${level2Id}`}
//                                               className="level"
//                                               id={`level-2-${level1Id}-${level2Id}`}
//                                             >
//                                               <h3 className="text-primary font-bold">
//                                                 Tiểu mục - {item?.so_tieu_muc}
//                                               </h3>

//                                               <div className="flex flex-col sm:flex-row gap-2 mb-4">
//                                                 <input
//                                                   type="text"
//                                                   className="h-10 w-full sm:w-1/12 p-2 border rounded"
//                                                   placeholder="Số"
//                                                   value={`${item?.so_tieu_muc}`}
//                                                   readOnly
//                                                 />
//                                                 <input
//                                                   type="text"
//                                                   className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                                   placeholder="Tên Tiểu mục"
//                                                   defaultValue={
//                                                     item?.ten_tieu_muc || ''
//                                                   }
//                                                   id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                                   readOnly
//                                                 />

//                                                 <textarea
//                                                   className="w-full sm:w-9/12 p-2 border rounded"
//                                                   id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                                   defaultValue={
//                                                     item?.mo_ta_tieu_muc || ''
//                                                   }
//                                                   rows={2}

//                                                   placeholder="Nội dung Tiểu mục"
//                                                   readOnly
//                                                 ></textarea>
//                                               </div>

//                                               {existingDataTieuMuc?.cac_tieu_muc_con &&
//                                                 Array.isArray(
//                                                   existingDataTieuMuc?.cac_tieu_muc_con,
//                                                 ) &&
//                                                 existingDataTieuMuc?.cac_tieu_muc_con
//                                                   .filter(
//                                                     (item) => item.hidden === 0,
//                                                   )
//                                                   .map((item, level3Index) => {
//                                                     const level3Id =
//                                                       level3Index + 1;

//                                                     return (
//                                                       <div
//                                                         key={`${level1Id}-${level2Id}-${level3Id}`}
//                                                         data-so-tieu-muc-con={
//                                                           item?.so_tieu_muc_con
//                                                         }
//                                                         className="level"
//                                                         id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
//                                                       >
//                                                         <h3 className="text-success font-bold">
//                                                           Tiểu mục con -{' '}
//                                                           {
//                                                             item?.so_tieu_muc_con
//                                                           }
//                                                         </h3>

//                                                         <div

//                                                           className="input-group flex flex-col sm:flex-row gap-2"
//                                                           key={
//                                                             item?.so_tieu_muc_con
//                                                           }
//                                                         >
//                                                           <input
//                                                             type="text"
//                                                             className="h-10 w-full sm:w-1/12 p-2 rounded"
//                                                             placeholder="Số"
//                                                             value={`${item?.so_tieu_muc_con}`}
//                                                             readOnly
//                                                           />
//                                                           <input
//                                                             type="text"
//                                                             className="h-10 w-full sm:w-2/12 p-2 rounded"
//                                                             placeholder="Tên Tiểu mục con"
//                                                             id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                             defaultValue={
//                                                               item?.ten_tieu_muc_con
//                                                                 ? item?.ten_tieu_muc_con
//                                                                 : ''
//                                                             }
//                                                             readOnly
//                                                           />
//                                                           <input
//                                                             //className="mr-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                                                             className="h-10 w-full sm:w-1/12 p-2 border rounded"
//                                                             type="number"
//                                                             min={1}
//                                                             placeholder="Mức"
//                                                             id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                             defaultValue={
//                                                               item?.muc
//                                                                 ? item?.muc
//                                                                 : ''
//                                                             }
//                                                             onInput={(
//                                                               e: any,
//                                                             ) => {
//                                                               if (
//                                                                 e.target
//                                                                   .value <= 1
//                                                               )
//                                                                 e.target.value = 1;
//                                                             }}
//                                                             readOnly
//                                                           />
//                                                           <textarea
//                                                             id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                             className="w-full sm:w-9/12 p-2 border rounded"
//                                                             defaultValue={
//                                                               item?.mo_ta_tieu_muc_con
//                                                                 ? item?.mo_ta_tieu_muc_con
//                                                                 : ''
//                                                             }
//                                                             rows={2}

//                                                             placeholder="Nội dung Tiểu mục con"
//                                                             readOnly
//                                                           ></textarea>
//                                                         </div>

//                                                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
//                                                           <div className="flex items-center">
//                                                             <input
//                                                               title={
//                                                                 isEvaluationLocked
//                                                                   ? `Không thể chọn do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                   : `Chọn đánh giá`
//                                                               }
//                                                               type="checkbox"
//                                                               checked={
//                                                                 evaluationScores[
//                                                                   item
//                                                                     .id_tieumuccon
//                                                                 ] === 1
//                                                               }
//                                                               onChange={(e) => {
//                                                                 if (
//                                                                   e.target
//                                                                     .checked
//                                                                 ) {
//                                                                   handleEvaluationChange(
//                                                                     item.id_tieumuccon,
//                                                                     1,
//                                                                   );
//                                                                 }
//                                                               }}
//                                                               disabled={
//                                                                 isEvaluationLocked
//                                                               }
//                                                               className={`h-5 w-5 ml-2 ${
//                                                                 isEvaluationLocked
//                                                                   ? 'cursor-not-allowed'
//                                                                   : 'cursor-pointer'
//                                                               } rounded border-[1.5px] border-stroke bg-transparent accent-primary`}
//                                                             />
//                                                             <label className="ml-2 text-black text-sm sm:text-base">
//                                                               Đạt
//                                                             </label>
//                                                           </div>
//                                                           <div className="flex items-center">
//                                                             <input
//                                                               title={
//                                                                 isEvaluationLocked
//                                                                   ? `Không thể chọn do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                   : `Chọn đánh giá`
//                                                               }
//                                                               type="checkbox"
//                                                               checked={
//                                                                 evaluationScores[
//                                                                   item
//                                                                     .id_tieumuccon
//                                                                 ] === 0
//                                                               }
//                                                               onChange={(e) => {
//                                                                 if (
//                                                                   e.target
//                                                                     .checked
//                                                                 ) {
//                                                                   handleEvaluationChange(
//                                                                     item.id_tieumuccon,
//                                                                     0,
//                                                                   );
//                                                                 }
//                                                               }}
//                                                               disabled={
//                                                                 isEvaluationLocked
//                                                               }
//                                                               className={`h-5 w-5 ml-2 ${
//                                                                 isEvaluationLocked
//                                                                   ? 'cursor-not-allowed'
//                                                                   : 'cursor-pointer'
//                                                               } rounded border-[1.5px] border-stroke bg-transparent accent-primary`}
//                                                             />
//                                                             <label className="ml-2 text-black text-sm sm:text-base">
//                                                               Không đạt
//                                                             </label>
//                                                           </div>
//                                                         </div>
//                                                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
//                                                           <div className="w-full">
//                                                             <textarea
//                                                               rows={2}
//                                                               placeholder="Nhập ghi chú đánh giá..."
//                                                               className="w-full p-2 border rounded"
//                                                               value={
//                                                                 evaluationNotes[
//                                                                   item
//                                                                     .id_tieumuccon
//                                                                 ] || ''
//                                                               }
//                                                               onChange={(e) =>
//                                                                 handleNoteChange(
//                                                                   item.id_tieumuccon,
//                                                                   e.target
//                                                                     .value,
//                                                                 )
//                                                               }
//                                                               disabled={
//                                                                 isEvaluationLocked
//                                                               }
//                                                             ></textarea>
//                                                           </div>
//                                                         </div>

//                                                         <div className="flex flex-col sm:flex-row gap-2 mt-4">
//                                                           <div className="flex items-center">
//                                                             <input
//                                                               type="file"
//                                                               id={`file-${item.id_tieumuccon}`}
//                                                               onChange={(e) =>
//                                                                 handleFileUpload(
//                                                                   e,
//                                                                   item?.id_tieumuccon,
//                                                                 )
//                                                               }
//                                                               className="hidden"
//                                                               multiple
//                                                               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                                                             />
//                                                             <button
//                                                               title={
//                                                                 isEvaluationLocked
//                                                                   ? `Không thể tải file do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                   : `Đính kèm file`
//                                                               }
//                                                               onClick={() =>
//                                                                 document
//                                                                   .getElementById(
//                                                                     `file-${item.id_tieumuccon}`,
//                                                                   )
//                                                                   ?.click()
//                                                               }
//                                                               disabled={
//                                                                 isEvaluationLocked
//                                                               }
//                                                               className={`${
//                                                                 isEvaluationLocked
//                                                                   ? 'cursor-not-allowed opacity-50'
//                                                                   : 'cursor-pointer'
//                                                               } bg-primary text-white px-3 py-1 rounded hover:bg-opacity-90 mr-2 flex items-center`}
//                                                             >
//                                                               <UploadOutlined className="mr-1" />{' '}
//                                                               Tải file lên
//                                                             </button>

//                                                             <button
//                                                               onClick={() =>
//                                                                 showFileList(
//                                                                   item.id_tieumuccon,
//                                                                 )
//                                                               }
//                                                               className="bg-success text-white px-3 py-1 rounded hover:bg-opacity-90 flex items-center"
//                                                             >
//                                                               <EyeOutlined className="mr-1" />
//                                                               Xem danh sách file
//                                                               (
//                                                               {fileCounts[
//                                                                 item
//                                                                   .id_tieumuccon
//                                                               ] || 0}
//                                                               )
//                                                             </button>
//                                                           </div>
//                                                         </div>
//                                                       </div>
//                                                     );
//                                                   })}
//                                             </div>
//                                           </>
//                                         );
//                                       })}
//                                 </div>
//                               );
//                             })
//                         ) : (
//                           <>
//                             {' '}
//                             <div className="text-center text-lg font-medium">
//                               Không tìm thấy tiêu chí nào
//                             </div>
//                           </>
//                         )}
//                       </>
//                     ) : (
//                       <>
//                         <div className="text-center">
//                           <LoadingOutlined style={{ fontSize: '50px' }} />
//                         </div>
//                       </>
//                     )} */}
//                     {loadingDanhMuc === false ? (
//                       <>
//                         {filteredTieuChi &&
//                         Array.isArray(filteredTieuChi) &&
//                         filteredTieuChi.length > 0 ? (
//                           filteredTieuChi
//                             .filter((tc) => tc.hidden === 0)
//                             .map((existingData) => {
//                               const level1Id = existingData.so_tieuchi;
//                               const showTieuChi =
//                                 !searchTerm || searchResults.tieuChi[level1Id];

//                               return (
//                                 <div
//                                   key={`level-1-${level1Id}`}
//                                   className="level"
//                                   id={`level-1-${level1Id}`}
//                                 >
//                                   {/* Chỉ hiển thị tiêu chí nếu nó phù hợp hoặc không có từ khóa tìm kiếm */}
//                                   {showTieuChi && (
//                                     <>
//                                       <h3 className="text-danger font-bold">
//                                         Tiêu chí - {level1Id}
//                                       </h3>
//                                       {/* {existingData.id_tieuchi} */}

//                                       <div className="flex flex-col sm:flex-row gap-2 mb-4">
//                                         <input
//                                           className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                           type="text"
//                                           placeholder="Số"
//                                           value={level1Id}
//                                           readOnly
//                                         />

//                                         <input
//                                           type="text"
//                                           className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                           placeholder="Tên Tiêu chí"
//                                           id={`ten-tieuchi-cap1-${level1Id}`}
//                                           defaultValue={
//                                             existingData?.ten_tieuchi || ''
//                                           }
//                                           readOnly
//                                         />
//                                         <textarea
//                                           id={`noidung-tieuchi-cap1-${level1Id}`}
//                                           className="w-full sm:w-9/12 p-2 border rounded"
//                                           defaultValue={
//                                             existingData?.mo_ta || ''
//                                           }
//                                           rows={2}
//                                           placeholder="Nội dung Tiêu chí"
//                                           readOnly
//                                         ></textarea>
//                                       </div>
//                                     </>
//                                   )}

//                                   {existingData?.cac_tieu_muc &&
//                                     Array.isArray(existingData?.cac_tieu_muc) &&
//                                     existingData?.cac_tieu_muc
//                                       .filter((item) => item.hidden === 0)
//                                       .map((item, level2Index) => {
//                                         const level2Id = level2Index + 1;
//                                         const tieuMucKey = `${level1Id}-${item.so_tieu_muc}`;
//                                         const showTieuMuc =
//                                           !searchTerm ||
//                                           searchResults.tieuMuc[tieuMucKey];

//                                         const existingDataTieuMuc =
//                                           existingData?.cac_tieu_muc.find(
//                                             (tc) =>
//                                               tc.so_tieu_muc ===
//                                                 item?.so_tieu_muc &&
//                                               tc.hidden === 0,
//                                           );

//                                         return (
//                                           <>
//                                             <div
//                                               key={`${level1Id}-${level2Id}`}
//                                               className="level"
//                                               id={`level-2-${level1Id}-${level2Id}`}
//                                             >
//                                               {/* Chỉ hiển thị tiểu mục nếu nó phù hợp */}
//                                               {showTieuMuc && (
//                                                 <>
//                                                   <h3 className="text-primary font-bold">
//                                                     Tiểu mục -{' '}
//                                                     {item?.so_tieu_muc}
//                                                   </h3>
//                                                   {/* {item?.id_tieumuc} */}

//                                                   <div className="flex flex-col sm:flex-row gap-2 mb-4">
//                                                     <input
//                                                       type="text"
//                                                       className="h-10 w-full sm:w-1/12 p-2 border rounded"
//                                                       placeholder="Số"
//                                                       value={`${item?.so_tieu_muc}`}
//                                                       readOnly
//                                                     />
//                                                     <input
//                                                       type="text"
//                                                       className="h-10 w-full sm:w-2/12 p-2 border rounded"
//                                                       placeholder="Tên Tiểu mục"
//                                                       defaultValue={
//                                                         item?.ten_tieu_muc || ''
//                                                       }
//                                                       id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                                       readOnly
//                                                     />

//                                                     <textarea
//                                                       className="w-full sm:w-9/12 p-2 border rounded"
//                                                       id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                                       defaultValue={
//                                                         item?.mo_ta_tieu_muc ||
//                                                         ''
//                                                       }
//                                                       rows={2}
//                                                       placeholder="Nội dung Tiểu mục"
//                                                       readOnly
//                                                     ></textarea>
//                                                   </div>
//                                                 </>
//                                               )}

//                                               {existingDataTieuMuc?.cac_tieu_muc_con &&
//                                                 Array.isArray(
//                                                   existingDataTieuMuc?.cac_tieu_muc_con,
//                                                 ) &&
//                                                 existingDataTieuMuc?.cac_tieu_muc_con
//                                                   .filter(
//                                                     (item) => item.hidden === 0,
//                                                   )
//                                                   .map((item, level3Index) => {
//                                                     const level3Id =
//                                                       level3Index + 1;
//                                                     const tieuMucConKey = `${level1Id}-${existingDataTieuMuc.so_tieu_muc}-${item.so_tieu_muc_con}`;
//                                                     const showTieuMucCon =
//                                                       !searchTerm ||
//                                                       searchResults.tieuMucCon[
//                                                         tieuMucConKey
//                                                       ];

//                                                     return (
//                                                       <>
//                                                         {/* Chỉ hiển thị tiểu mục con nếu nó phù hợp */}
//                                                         {showTieuMucCon && (
//                                                           <div
//                                                             key={`${level1Id}-${level2Id}-${level3Id}`}
//                                                             data-so-tieu-muc-con={
//                                                               item?.so_tieu_muc_con
//                                                             }
//                                                             className="level"
//                                                             id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
//                                                           >
//                                                             <h3 className="text-success font-bold">
//                                                               Tiểu mục con -{' '}
//                                                               {
//                                                                 item?.so_tieu_muc_con
//                                                               }
//                                                             </h3>
//                                                             {
//                                                               item?.id_tieumuccon
//                                                             }
//                                                             <div
//                                                               className="input-group flex flex-col sm:flex-row gap-2"
//                                                               key={
//                                                                 item?.so_tieu_muc_con
//                                                               }
//                                                             >
//                                                               <input
//                                                                 type="text"
//                                                                 className="h-10 w-full sm:w-1/12 p-2 rounded"
//                                                                 placeholder="Số"
//                                                                 value={`${item?.so_tieu_muc_con}`}
//                                                                 readOnly
//                                                               />
//                                                               <input
//                                                                 type="text"
//                                                                 className="h-10 w-full sm:w-2/12 p-2 rounded"
//                                                                 placeholder="Tên Tiểu mục con"
//                                                                 id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                                 defaultValue={
//                                                                   item?.ten_tieu_muc_con
//                                                                     ? item?.ten_tieu_muc_con
//                                                                     : ''
//                                                                 }
//                                                                 readOnly
//                                                               />
//                                                               <input
//                                                                 className="h-10 w-full sm:w-1/12 p-2 border rounded"
//                                                                 type="number"
//                                                                 min={1}
//                                                                 placeholder="Mức"
//                                                                 id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                                 defaultValue={
//                                                                   item?.muc
//                                                                     ? item?.muc
//                                                                     : ''
//                                                                 }
//                                                                 onInput={(
//                                                                   e: any,
//                                                                 ) => {
//                                                                   if (
//                                                                     e.target
//                                                                       .value <=
//                                                                     1
//                                                                   )
//                                                                     e.target.value = 1;
//                                                                 }}
//                                                                 readOnly
//                                                               />
//                                                               <textarea
//                                                                 id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                                 className="w-full sm:w-9/12 p-2 border rounded"
//                                                                 defaultValue={
//                                                                   item?.mo_ta_tieu_muc_con
//                                                                     ? item?.mo_ta_tieu_muc_con
//                                                                     : ''
//                                                                 }
//                                                                 rows={2}
//                                                                 placeholder="Nội dung Tiểu mục con"
//                                                                 readOnly
//                                                               ></textarea>
//                                                             </div>

//                                                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
//                                                               <div className="flex items-center">
//                                                                 <input
//                                                                   title={
//                                                                     isEvaluationLocked
//                                                                       ? `Không thể chọn do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                       : `Chọn đánh giá`
//                                                                   }
//                                                                   type="checkbox"
//                                                                   checked={
//                                                                     evaluationScores[
//                                                                       item
//                                                                         .id_tieumuccon
//                                                                     ] === 1
//                                                                   }
//                                                                   onChange={(
//                                                                     e,
//                                                                   ) => {
//                                                                     if (
//                                                                       e.target
//                                                                         .checked
//                                                                     ) {
//                                                                       handleEvaluationChange(
//                                                                         item.id_tieumuccon,
//                                                                         1,
//                                                                       );
//                                                                     }
//                                                                   }}
//                                                                   disabled={
//                                                                     isEvaluationLocked
//                                                                   }
//                                                                   className={`h-5 w-5 ml-2 ${
//                                                                     isEvaluationLocked
//                                                                       ? 'cursor-not-allowed'
//                                                                       : 'cursor-pointer'
//                                                                   } rounded border-[1.5px] border-stroke bg-transparent accent-primary`}
//                                                                 />
//                                                                 <label className="ml-2 text-black text-sm sm:text-base">
//                                                                   Đạt
//                                                                 </label>
//                                                               </div>
//                                                               <div className="flex items-center">
//                                                                 <input
//                                                                   title={
//                                                                     isEvaluationLocked
//                                                                       ? `Không thể chọn do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                       : `Chọn đánh giá`
//                                                                   }
//                                                                   type="checkbox"
//                                                                   checked={
//                                                                     evaluationScores[
//                                                                       item
//                                                                         .id_tieumuccon
//                                                                     ] === 0
//                                                                   }
//                                                                   onChange={(
//                                                                     e,
//                                                                   ) => {
//                                                                     if (
//                                                                       e.target
//                                                                         .checked
//                                                                     ) {
//                                                                       handleEvaluationChange(
//                                                                         item.id_tieumuccon,
//                                                                         0,
//                                                                       );
//                                                                     }
//                                                                   }}
//                                                                   disabled={
//                                                                     isEvaluationLocked
//                                                                   }
//                                                                   className={`h-5 w-5 ml-2 ${
//                                                                     isEvaluationLocked
//                                                                       ? 'cursor-not-allowed'
//                                                                       : 'cursor-pointer'
//                                                                   } rounded border-[1.5px] border-stroke bg-transparent accent-primary`}
//                                                                 />
//                                                                 <label className="ml-2 text-black text-sm sm:text-base">
//                                                                   Không đạt
//                                                                 </label>
//                                                               </div>
//                                                             </div>
//                                                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
//                                                               <div className="w-full">
//                                                                 <textarea
//                                                                   rows={2}
//                                                                   placeholder="Nhập ghi chú đánh giá..."
//                                                                   className="w-full p-2 border rounded"
//                                                                   value={
//                                                                     evaluationNotes[
//                                                                       item
//                                                                         .id_tieumuccon
//                                                                     ] || ''
//                                                                   }
//                                                                   onChange={(
//                                                                     e,
//                                                                   ) =>
//                                                                     handleNoteChange(
//                                                                       item.id_tieumuccon,
//                                                                       e.target
//                                                                         .value,
//                                                                     )
//                                                                   }
//                                                                   disabled={
//                                                                     isEvaluationLocked
//                                                                   }
//                                                                 ></textarea>
//                                                               </div>
//                                                             </div>

//                                                             <div className="flex flex-col sm:flex-row gap-2 mt-4">
//                                                               <div className="flex items-center">
//                                                                 <input
//                                                                   type="file"
//                                                                   id={`file-${item.id_tieumuccon}`}
//                                                                   onChange={(
//                                                                     e,
//                                                                   ) =>
//                                                                     handleFileUpload(
//                                                                       e,
//                                                                       item?.id_tieumuccon,
//                                                                     )
//                                                                   }
//                                                                   className="hidden"
//                                                                   multiple
//                                                                   accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                                                                 />
//                                                                 <button
//                                                                   title={
//                                                                     isEvaluationLocked
//                                                                       ? `Không thể tải file do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                                                                       : `Đính kèm file`
//                                                                   }
//                                                                   onClick={() =>
//                                                                     document
//                                                                       .getElementById(
//                                                                         `file-${item.id_tieumuccon}`,
//                                                                       )
//                                                                       ?.click()
//                                                                   }
//                                                                   disabled={
//                                                                     isEvaluationLocked
//                                                                   }
//                                                                   className={`${
//                                                                     isEvaluationLocked
//                                                                       ? 'cursor-not-allowed opacity-50'
//                                                                       : 'cursor-pointer'
//                                                                   } bg-primary text-white px-3 py-1 rounded hover:bg-opacity-90 mr-2 flex items-center`}
//                                                                 >
//                                                                   <UploadOutlined className="mr-1" />{' '}
//                                                                   Tải file lên
//                                                                 </button>

//                                                                 <button
//                                                                   onClick={() =>
//                                                                     showFileList(
//                                                                       item.id_tieumuccon,
//                                                                     )
//                                                                   }
//                                                                   className="bg-success text-white px-3 py-1 rounded hover:bg-opacity-90 flex items-center"
//                                                                 >
//                                                                   <EyeOutlined className="mr-1" />
//                                                                   Xem danh sách
//                                                                   file (
//                                                                   {fileCounts[
//                                                                     item
//                                                                       .id_tieumuccon
//                                                                   ] || 0}
//                                                                   )
//                                                                 </button>
//                                                               </div>
//                                                             </div>
//                                                           </div>
//                                                         )}
//                                                       </>
//                                                     );
//                                                   })}
//                                             </div>
//                                           </>
//                                         );
//                                       })}
//                                 </div>
//                               );
//                             })
//                         ) : (
//                           <>
//                             {' '}
//                             <div className="text-center text-lg font-medium">
//                               {searchTerm
//                                 ? 'Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm'
//                                 : 'Không tìm thấy tiêu chí nào'}
//                             </div>
//                           </>
//                         )}
//                       </>
//                     ) : (
//                       <>
//                         <div className="text-center">
//                           <LoadingOutlined style={{ fontSize: '50px' }} />
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           <Result
//             status="403"
//             title="403"
//             subTitle="Bạn không có quyền truy cập trang này"
//             extra={
//               <Link to={'/quan-ly-tieu-chi'}>
//                 <button className="hover:bg-primary bg-primary p-2 text-white rounded">
//                   Quay lại trang chủ
//                 </button>
//               </Link>
//             }
//           />
//         </>
//       )}

//       <Modal
//         title="Danh sách file đã tải lên"
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//         width="90%"
//         className="max-w-2xl"
//       >
//         <List
//           dataSource={storedFiles[selectedTieuMucCon] || []}
//           renderItem={(file) => (
//             <List.Item
//               actions={[
//                 <span
//                   title="Tải file về máy"
//                   onClick={() =>
//                     window.open(
//                       `http://172.16.0.60:883/api/download_file/${file.fileId}`,
//                       '_blank',
//                     )
//                   }
//                   className="text-primary hover:text-primary-dark cursor-pointer"
//                 >
//                   <DownloadOutlined /> Tải về
//                 </span>,
//                 <span
//                   title={
//                     isEvaluationLocked
//                       ? `Không thể xóa do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
//                       : `Xóa file`
//                   }
//                   onClick={() =>
//                     !isEvaluationLocked &&
//                     handleDeleteFile(selectedTieuMucCon, file.fileId)
//                   }
//                   className={`text-danger hover:text-danger-dark ${
//                     isEvaluationLocked
//                       ? 'cursor-not-allowed opacity-50'
//                       : 'cursor-pointer'
//                   } `}
//                 >
//                   <DeleteOutlined /> Xóa
//                 </span>,
//               ]}
//             >
//               <div className="break-all">{file.fileName}</div>
//             </List.Item>
//           )}
//         />
//       </Modal>
//     </>
//   );
// };

// export default DanhGiaTieuChiKhoaPhong;
