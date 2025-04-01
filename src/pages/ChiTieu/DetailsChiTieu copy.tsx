// import { useEffect, useState } from 'react';
// import './ChiTieuCap1.css';
// import { message, Result } from 'antd';
// import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
// import { DanhMuc } from '../../types/danhmuc';
// import { DanhSachPhanQuyenTieuChi } from '../../api/TieuChiKhoaPhongAPI';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { DanhSachDanhGia } from '../../api/ChiTieuAPI';

// const DetailsChiTieu: React.FC = () => {
//   const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);
//   const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
//     DanhMuc[]
//   >([]);
//   const [messageApi, contextHolder] = message.useMessage();
//   const [evaluationData, setEvaluationData] = useState<any>(null);
//   const [evaluationScores, setEvaluationScores] = useState<
//     Record<string, number>
//   >({});
//   const [evaluationEvaluators, setEvaluationEvaluators] = useState<
//     Record<string, string>
//   >({});

//   const [fileList, setFileList] = useState<Record<string, any[]>>({});

//   const { dotId } = useParams();
//   const [status, setStatus] = useState<string>('');
//   const [khoaPhong, setKhoaPhong] = useState('');
//   const [evaluationDescriptions, setEvaluationDescriptions] = useState<
//     Record<string, string>
//   >({});

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

//   useEffect(() => {
//     if (dotId) {
//       fetchFileList();
//     }
//   }, [dotId]);

//   const fetchFileList = async () => {
//     try {
//       const response = await fetch('http://172.16.0.60:883/api/list_files');
//       const data = await response.json();

//       // Filter files by dotId and group by id_tieumuccon
//       const filteredAndGroupedFiles = data
//         .filter((file: any) => file.id_dot_danh_gia === dotId) // Filter files by the current evaluation ID
//         .reduce((acc: any, file: any) => {
//           if (!acc[file.id_tieumuccon]) {
//             acc[file.id_tieumuccon] = [];
//           }
//           acc[file.id_tieumuccon].push(file);
//           return acc;
//         }, {});

//       setFileList(filteredAndGroupedFiles);
//     } catch (error) {
//       messageApi.error('Lỗi khi tải danh sách file');
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

//   const handleDownload = async (fileId: string, filename: string) => {
//     try {
//       const response = await fetch(
//         `http://172.16.0.60:883/api/download_file/${fileId}`,
//       );
//       const blob = await response.blob();

//       // Create download link
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       messageApi.error('Lỗi khi tải file');
//     }
//   };

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

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch evaluation data
//         const evaluations = await DanhSachDanhGia();
//         const selectedEvaluation = evaluations.find(
//           (e: any) => e._id === dotId,
//         );

//         if (!selectedEvaluation) {
//           messageApi.error('Không tìm thấy dữ liệu đánh giá');
//           return;
//         }

//         setEvaluationData(selectedEvaluation);

//         // Khởi tạo evaluationScores từ dữ liệu đánh giá
//         const scores: Record<string, number> = {};
//         const descriptions: Record<string, string> = {};
//         const evaluators: Record<string, string> = {}; // Add this for evaluators

//         selectedEvaluation?.danh_sach_danh_gia?.forEach((tieuChi: any) => {
//           tieuChi.tieu_muc.forEach((tieuMuc: any) => {
//             scores[tieuMuc.id_tieumuc] = tieuMuc.danh_gia;

//             if (tieuMuc.mota_danhgia) {
//               const motaEntries = tieuMuc.mota_danhgia.split(',');
//               motaEntries.forEach((entry: string) => {
//                 const [id, mota] = entry.split(':');
//                 if (id && mota && mota !== 'none') {
//                   descriptions[id] = mota;
//                 }
//               });
//             }

//             if (tieuMuc.cac_tieu_muc_con) {
//               tieuMuc.cac_tieu_muc_con.forEach((tmc: any) => {
//                 scores[tmc.id_tieumuccon] = tmc.danh_gia;
//                 // Store the evaluator information if available
//                 if (tmc.nguoi_danhgia) {
//                   evaluators[tmc.id_tieumuccon] = tmc.nguoi_danhgia;
//                 }
//               });
//             }

//             if (tieuMuc.cac_tieu_muc_con) {
//               tieuMuc.cac_tieu_muc_con.forEach((tmc: any) => {
//                 scores[tmc.id_tieumuccon] = tmc.danh_gia;
//               });
//             }
//           });
//         });
//         setEvaluationScores(scores);
//         setEvaluationDescriptions(descriptions);
//         setEvaluationEvaluators(evaluators); // Set the evaluators state

//         let data = await DanhSachPhanQuyenTieuChi();
//         if (data) {
//           // Tìm trong mảng phan_quyen của từng phần tử
//           let tieuchicuakhoa = data
//             .flatMap((item: any) =>
//               item.phan_quyen.find(
//                 (phanquyen: any) =>
//                   phanquyen.ten_khoa === selectedEvaluation?.ten_khoa,
//               ),
//             )
//             .find(Boolean); // lấy phần tử đầu tiên khác null/undefined

//           if (
//             tieuchicuakhoa &&
//             Array.isArray(tieuchicuakhoa?.danh_sach_tieu_chi)
//           ) {
//             setDanhSachTieuChiTheoKhoa(tieuchicuakhoa.danh_sach_tieu_chi);
//           }
//         }

//         setLoadingDanhMuc(false);
//       } catch (error) {
//         console.log(error);
//         messageApi.error('Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu');
//       }
//     };

//     if (dotId) {
//       fetchData();
//     }
//   }, [dotId, messageApi]);

//   return (
//     <>
//       {contextHolder}
//       {khoaPhong === 'Phòng Quản Lý chất lượng' ? (
//         <>
//           <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//             {evaluationData && (
//               <div className="mb-4">
//                 <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
//                   Thông tin đợt đánh giá
//                 </h2>
//                 <p>Khoa/Phòng: {evaluationData.ten_khoa}</p>
//                 <p>
//                   Thời gian:{' '}
//                   {formatDate(evaluationData.nhan_vien.split('-')[1]?.trim())}
//                 </p>
//                 {/* <p>
//                   Người đánh giá:{' '}
//                   {evaluationData.nhan_vien.split('-')[0]?.trim()}
//                 </p> */}
//               </div>
//             )}

//             <div id="form-container">
//               <div id="levels-container">
//                 {loadingDanhMuc === false ? (
//                   // Copy phần render criteria list từ DanhGiaTieuChiKhoaPhong
//                   // Nhưng chỉ hiển thị, không cho phép chỉnh sửa
//                   <>
//                     {danhSachTieuChiTheoKhoa &&
//                     Array.isArray(danhSachTieuChiTheoKhoa) &&
//                     danhSachTieuChiTheoKhoa.length > 0 ? (
//                       danhSachTieuChiTheoKhoa
//                         .filter((tc) => tc.hidden === 0)
//                         .map((existingData) => {
//                           const level1Id = existingData.so_tieuchi;

//                           return (
//                             <div
//                               key={`level-1-${level1Id}`}
//                               className="level"
//                               id={`level-1-${level1Id}`}
//                             >
//                               <h3 className="text-danger font-bold text-base md:text-lg">
//                                 Tiêu chí - {level1Id}
//                               </h3>

//                               <div className="input-group flex flex-col md:flex-row gap-2 md:gap-4">
//                                 <input
//                                   type="text"
//                                   placeholder="Số"
//                                   value={level1Id}
//                                   readOnly
//                                   className="h-10 w-full md:w-[8%]"
//                                 />

//                                 <input
//                                   type="text"
//                                   placeholder="Tên Tiêu chí"
//                                   id={`ten-tieuchi-cap1-${level1Id}`}
//                                   defaultValue={existingData?.ten_tieuchi || ''}
//                                   className="h-10 w-full md:w-[10%]"
//                                   readOnly
//                                 />
//                                 <textarea
//                                   id={`noidung-tieuchi-cap1-${level1Id}`}
//                                   className="w-full md:w-[70%] border rounded"
//                                   defaultValue={existingData?.mo_ta || ''}
//                                   rows={2}
//                                   // style={{
//                                   //   width: '70%',
//                                   //   // resize: 'none',
//                                   //   overflow: 'hidden',
//                                   //   verticalAlign: 'middle',
//                                   //   padding: '0 10px',
//                                   //   lineHeight: '2.8',
//                                   //   border: '1px solid #ced4da',
//                                   //   borderRadius: '0.25rem',
//                                   // }}
//                                   placeholder="Nội dung Tiêu chí"
//                                   readOnly
//                                 ></textarea>
//                               </div>

//                               {existingData?.cac_tieu_muc &&
//                                 Array.isArray(existingData?.cac_tieu_muc) &&
//                                 existingData?.cac_tieu_muc
//                                   .filter((item) => item.hidden === 0)
//                                   .map((item, level2Index) => {
//                                     const level2Id = level2Index + 1;

//                                     const existingDataTieuMuc =
//                                       existingData?.cac_tieu_muc.find(
//                                         (tc) =>
//                                           tc.so_tieu_muc ===
//                                             item?.so_tieu_muc &&
//                                           tc.hidden === 0,
//                                       );

//                                     return (
//                                       <>
//                                         <div
//                                           key={`${level1Id}-${level2Id}`}
//                                           className="level"
//                                           id={`level-2-${level1Id}-${level2Id}`}
//                                         >
//                                           <h3 className="text-primary font-bold text-base md:text-lg">
//                                             Tiểu mục - {item?.so_tieu_muc}
//                                           </h3>

//                                           <div className="input-group flex flex-col md:flex-row gap-2 md:gap-4">
//                                             <input
//                                               type="text"
//                                               placeholder="Số"
//                                               value={`${item?.so_tieu_muc}`}
//                                               readOnly
//                                               className="h-10 w-full md:w-[8%]"
//                                             />
//                                             <input
//                                               type="text"
//                                               placeholder="Tên Tiểu mục"
//                                               defaultValue={
//                                                 item?.ten_tieu_muc || ''
//                                               }
//                                               id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                               className="h-10 w-full md:w-[10%]"
//                                               readOnly
//                                             />

//                                             <textarea
//                                               id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
//                                               className="w-full md:w-[70%] border rounded"
//                                               defaultValue={
//                                                 item?.mo_ta_tieu_muc || ''
//                                               }
//                                               rows={2}
//                                               // style={{
//                                               //   width: '70%',
//                                               //   // resize: 'none',
//                                               //   overflow: 'hidden',
//                                               //   verticalAlign: 'middle',
//                                               //   padding: '0 10px',
//                                               //   lineHeight: '2.8',
//                                               //   border: '1px solid #ced4da',
//                                               //   borderRadius: '0.25rem',
//                                               // }}
//                                               placeholder="Nội dung Tiểu mục"
//                                               readOnly
//                                             ></textarea>
//                                           </div>

//                                           {existingDataTieuMuc?.cac_tieu_muc_con &&
//                                             Array.isArray(
//                                               existingDataTieuMuc?.cac_tieu_muc_con,
//                                             ) &&
//                                             existingDataTieuMuc?.cac_tieu_muc_con
//                                               .filter(
//                                                 (item) => item.hidden === 0,
//                                               )
//                                               .map((item, level3Index) => {
//                                                 const level3Id =
//                                                   level3Index + 1;

//                                                 return (
//                                                   <div
//                                                     key={`${level1Id}-${level2Id}-${level3Id}`}
//                                                     data-so-tieu-muc-con={
//                                                       item?.so_tieu_muc_con
//                                                     }
//                                                     className="level"
//                                                     id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
//                                                   >
//                                                     <h3 className="text-success font-bold text-base md:text-lg">
//                                                       Tiểu mục con -{' '}
//                                                       {item?.so_tieu_muc_con}
//                                                     </h3>

//                                                     <div
//                                                       className="input-group flex flex-col md:flex-row gap-2 md:gap-4"
//                                                       key={
//                                                         item?.so_tieu_muc_con
//                                                       }
//                                                     >
//                                                       <input
//                                                         type="text"
//                                                         placeholder="Số"
//                                                         value={`${item?.so_tieu_muc_con}`}
//                                                         readOnly
//                                                         className="h-10 w-full md:w-[8%]"
//                                                       />
//                                                       <input
//                                                         type="text"
//                                                         placeholder="Tên Tiểu mục con"
//                                                         id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                         defaultValue={
//                                                           item?.ten_tieu_muc_con
//                                                             ? item?.ten_tieu_muc_con
//                                                             : ''
//                                                         }
//                                                         className="h-10 w-full md:w-[10%]"
//                                                         readOnly
//                                                       />
//                                                       <input
//                                                         className="h-10 w-full md:w-[10%] border rounded"
//                                                         type="number"
//                                                         min={1}
//                                                         placeholder="Mức"
//                                                         id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                         defaultValue={
//                                                           item?.muc
//                                                             ? item?.muc
//                                                             : ''
//                                                         }
//                                                         onInput={(e: any) => {
//                                                           if (
//                                                             e.target.value <= 1
//                                                           )
//                                                             e.target.value = 1;
//                                                         }}
//                                                         readOnly
//                                                       />
//                                                       <textarea
//                                                         id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
//                                                         className="w-full md:w-[70%] border rounded"
//                                                         defaultValue={
//                                                           item?.mo_ta_tieu_muc_con
//                                                             ? item?.mo_ta_tieu_muc_con
//                                                             : ''
//                                                         }
//                                                         rows={2}
//                                                         // style={{
//                                                         //   width: '55%',
//                                                         //   // resize: 'none',
//                                                         //   overflow: 'hidden',
//                                                         //   verticalAlign:
//                                                         //     'middle',
//                                                         //   padding: '10px 10px',
//                                                         //   lineHeight: '1.5',
//                                                         //   border:
//                                                         //     '1px solid #ced4da',
//                                                         //   borderRadius:
//                                                         //     '0.25rem',
//                                                         // }}
//                                                         placeholder="Nội dung Tiểu mục con"
//                                                         readOnly
//                                                       ></textarea>

//                                                       <div className="h-10 mt-2 md:mt-0 md:ml-2 flex flex-col md:flex-row items-start md:items-center">
//                                                         <span className="font-bold mr-2">
//                                                           Đánh giá:
//                                                         </span>
//                                                         <span
//                                                           className={`font-bold ${
//                                                             evaluationScores[
//                                                               item?.id_tieumuccon
//                                                             ] === 1
//                                                               ? 'text-success'
//                                                               : 'text-danger'
//                                                           }`}
//                                                         >
//                                                           {evaluationScores[
//                                                             item?.id_tieumuccon
//                                                           ] === 1
//                                                             ? 'Đạt'
//                                                             : 'Không đạt'}
//                                                         </span>
//                                                       </div>
//                                                     </div>
//                                                     <div className="mt-4">
//                                                       {evaluationDescriptions[
//                                                         item?.id_tieumuccon
//                                                       ] ? (
//                                                         <div className="mb-4">
//                                                           <h4 className="font-bold mb-2">
//                                                             Ghi chú đánh giá:
//                                                           </h4>
//                                                           <div className="bg-gray-100 rounded">
//                                                             {
//                                                               evaluationDescriptions[
//                                                                 item?.id_tieumuccon
//                                                               ]
//                                                             }
//                                                           </div>
//                                                         </div>
//                                                       ) : (
//                                                         <div className="mb-4">
//                                                           <h4 className="font-bold mb-2">
//                                                             Ghi chú đánh giá:
//                                                           </h4>
//                                                           <div className="bg-gray-100 rounded">
//                                                             Không có ghi chú
//                                                           </div>
//                                                         </div>
//                                                       )}

//                                                       {/* <div className="mt-2">
//                                                         {evaluationEvaluators[
//                                                           item?.id_tieumuccon
//                                                         ] ? (
//                                                           <div className="flex items-center">
//                                                             <span className="font-bold mr-2">
//                                                               Người đánh giá:
//                                                             </span>
//                                                             <span>
//                                                               {
//                                                                 evaluationEvaluators[
//                                                                   item?.id_tieumuccon
//                                                                 ]
//                                                               }
//                                                             </span>
//                                                           </div>
//                                                         ) : (
//                                                           <>
//                                                             <h4 className="font-bold mr-2">
//                                                               Người đánh giá:
//                                                             </h4>
//                                                             <span>
//                                                               Không có thông tin
//                                                             </span>
//                                                           </>
//                                                         )}
//                                                       </div> */}

//                                                       {fileList[
//                                                         item?.id_tieumuccon
//                                                       ]?.length > 0 && (
//                                                         <>
//                                                           <h4 className="font-bold mb-2">
//                                                             Danh sách file đính
//                                                             kèm:
//                                                           </h4>
//                                                           <div className="space-y-2">
//                                                             {fileList[
//                                                               item?.id_tieumuccon
//                                                             ].map(
//                                                               (file: any) => (
//                                                                 <div
//                                                                   key={
//                                                                     file.file_id
//                                                                   }
//                                                                   className="flex items-center gap-4"
//                                                                 >
//                                                                   <span>
//                                                                     {
//                                                                       file.filename
//                                                                     }
//                                                                   </span>
//                                                                   <button
//                                                                     onClick={() =>
//                                                                       handleDownload(
//                                                                         file.file_id,
//                                                                         file.filename,
//                                                                       )
//                                                                     }
//                                                                     className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/80"
//                                                                   >
//                                                                     <DownloadOutlined />{' '}
//                                                                     Tải về
//                                                                   </button>
//                                                                 </div>
//                                                               ),
//                                                             )}
//                                                           </div>
//                                                         </>
//                                                       )}
//                                                     </div>
//                                                   </div>
//                                                 );
//                                               })}
//                                         </div>
//                                       </>
//                                     );
//                                   })}
//                             </div>
//                           );
//                         })
//                     ) : (
//                       <>
//                         {' '}
//                         <div className="text-center text-lg font-medium">
//                           Không tìm thấy tiêu chí nào
//                         </div>
//                       </>
//                     )}
//                   </>
//                 ) : (
//                   <div className="text-center">
//                     <LoadingOutlined style={{ fontSize: '50px' }} />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       ) : (
//         <>
//           <Result
//             status="403"
//             title="403"
//             subTitle="Bạn không có quyền truy cập trang này"
//             extra={
//               <Link to={'/danh-sach-tieu-chi'}>
//                 <button className="hover:bg-primary bg-primary p-2 text-white rounded">
//                   Quay lại trang chủ
//                 </button>
//               </Link>
//             }
//           />
//         </>
//       )}
//     </>
//   );
// };

// export default DetailsChiTieu;
