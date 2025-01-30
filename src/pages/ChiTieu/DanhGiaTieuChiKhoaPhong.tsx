import { useContext, useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import {
  DanhSachKhoaPhong,
  DanhSachPhanQuyenTieuChi,
} from '../../api/TieuChiKhoaPhongAPI';
import { UserContext } from '../../context/UserContext';
import Select from 'react-select';
import axios from 'axios';
import {
  CapNhatDanhGia,
  DanhSachDanhGia,
  ThemMoiDanhGia,
} from '../../api/ChiTieuAPI';
import { Link } from 'react-router-dom';

const DanhGiaTieuChiKhoaPhong: React.FC = () => {
  // const [level1Count] = useState<number>(83);
  const [selectedDot, setSelectedDot] = useState<string>('');
  const [evaluationScores, setEvaluationScores] = useState<
    Record<string, number>
  >({});
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

  const [danhSachTieuChiTheoKhoa, setDanhSachTieuChiTheoKhoa] = useState<
    DanhMuc[]
  >([]);

  const [dataKhoaPhong, setDataKhoaPhong] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  const { khoaPhong, tenNhanVien } = useContext(UserContext);

  const [danhSachDot, setDanhSachDot] = useState<any[]>([]);

  const [status, setStatus] = useState<string>('');

  const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);

  // useEffect(() => {
  //   const fetchKhoaPhong = async () => {
  //     try {
  //       let data = await DanhSachKhoaPhong();
  //       if (data) {
  //         setDataKhoaPhong(data);
  //         setLoadingDanhMuc(false);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       messageApi.open({
  //         type: 'error',
  //         content: `Đã có lỗi xảy ra trong quá trình danh sách khoa phòng`,
  //       });
  //     }
  //   };
  //   fetchKhoaPhong();
  // }, []);

  useEffect(() => {
    // // setSelectedKhoaPhong(khoaPhong);
    // setLoadingDanhMuc(true);

    // // Lấy dữ liệu đánh giá của khoa được chọn
    // const storageKey = `evaluationScores_${khoaPhong}`;
    // const savedScores = localStorage.getItem(storageKey);
    // if (savedScores) {
    //   setEvaluationScores(JSON.parse(savedScores));
    // }
    fetchDataTieuChiTheoKhoa(khoaPhong);
  }, [khoaPhong]);

  const fetchDataTieuChiTheoKhoa = async (khoaPhongValue: string) => {
    try {
      let data = await DanhSachPhanQuyenTieuChi();

      if (data) {
        let tieuchicuakhoa = data.find(
          (tieuchitheokhoa: any) => tieuchitheokhoa.ten_khoa === khoaPhongValue,
        );

        if (
          tieuchicuakhoa &&
          Array.isArray(tieuchicuakhoa?.danh_sach_tieu_chi)
        ) {
          setDanhSachTieuChiTheoKhoa(tieuchicuakhoa.danh_sach_tieu_chi);
        } else {
          setDanhSachTieuChiTheoKhoa([]);
        }
      }
      setLoadingDanhMuc(false);
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
      });
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

  const layDanhSachDotTheoKhoa = async () => {
    try {
      const response = await axios.get(
        `http://172.16.0.60:883/api/danh_gia_khoa`,
      );
      if (response.data) {
        // Filter periods by department and transform dates
        const dotTheoKhoa = response.data
          .filter((dot: any) => dot.ten_khoa === khoaPhong)
          .map((dot: any) => ({
            value: formatDate(dot.ngay_gio_danh_gia),
            label: formatDate(dot.ngay_gio_danh_gia),
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

  // useEffect(() => {
  //   if (danhSachTieuChiTheoKhoa.length > 0) {
  //     const defaultScores: Record<string, number> = {};

  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (tieuMuc.cac_tieu_muc_con) {
  //           tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .forEach((tmc) => {
  //               // Nếu chưa có đánh giá, mặc định là 0 (Không đạt)
  //               defaultScores[tmc.id_tieumuccon] =
  //                 evaluationScores[tmc.id_tieumuccon] ?? 0;
  //             });
  //         }
  //       });
  //     });

  //     setEvaluationScores(defaultScores);
  //   }
  // }, [danhSachTieuChiTheoKhoa]);

  // // Thêm useEffect mới để khởi tạo giá trị mặc định
  // useEffect(() => {
  //   if (selectedDot && danhSachTieuChiTheoKhoa.length > 0) {
  //     const defaultScores = { ...evaluationScores };

  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (tieuMuc.cac_tieu_muc_con) {
  //           tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .forEach((tmc) => {
  //               // Nếu chưa có giá trị trong evaluationScores thì gán mặc định là 0
  //               if (!(tmc.id_tieumuccon in defaultScores)) {
  //                 defaultScores[tmc.id_tieumuccon] = 0;
  //               }
  //             });
  //         }
  //       });
  //     });

  //     setEvaluationScores(defaultScores);
  //   }
  // }, [selectedDot, danhSachTieuChiTheoKhoa]);

  // // Thêm useEffect để lưu đánh giá vào localStorage khi có thay đổi
  // useEffect(() => {
  //   if (selectedDot && Object.keys(evaluationScores).length > 0) {
  //     const storageKey = `evaluationScores_${khoaPhong}_${selectedDot}`;
  //     localStorage.setItem(storageKey, JSON.stringify(evaluationScores));
  //   }
  // }, [evaluationScores, selectedDot, khoaPhong]);

  // // Thêm useEffect để khôi phục đánh giá từ localStorage khi chọn đợt
  // useEffect(() => {
  //   if (selectedDot) {
  //     const storageKey = `evaluationScores_${khoaPhong}_${selectedDot}`;
  //     const savedScores = localStorage.getItem(storageKey);
  //     if (savedScores) {
  //       setEvaluationScores(JSON.parse(savedScores));
  //     }
  //   }
  // }, [selectedDot, khoaPhong]);

  // useEffect(() => {
  //   const savedScores = localStorage.getItem('evaluationScores');
  //   if (savedScores) {
  //     setEvaluationScores(JSON.parse(savedScores));
  //   }
  // }, []);

  // useEffect(() => {
  //   const savedScores = localStorage.getItem('evaluationScores');
  //   if (savedScores) {
  //     setEvaluationScores(JSON.parse(savedScores));
  //   } else {
  //     // Initialize with default "Không đạt" (0) values
  //     const defaultScores: any = {};
  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (tieuMuc.cac_tieu_muc_con) {
  //           tieuMuc.cac_tieu_muc_con.forEach((tmc) => {
  //             defaultScores[tmc.id_tieumuccon] = 0;
  //           });
  //         }
  //       });
  //     });
  //     setEvaluationScores(defaultScores);
  //   }
  // }, [danhSachTieuChiTheoKhoa]);

  // useEffect(() => {
  //   if (danhSachTieuChiTheoKhoa.length > 0) {
  //     const savedScores = localStorage.getItem('evaluationScores');
  //     const parsedSavedScores = savedScores ? JSON.parse(savedScores) : {};

  //     const newScores: any = {};
  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (tieuMuc.cac_tieu_muc_con) {
  //           tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .forEach((tmc) => {
  //               // Kiểm tra nếu id đã tồn tại trong savedScores thì giữ nguyên giá trị
  //               // Nếu không thì gán giá trị mặc định là 0 (không đạt)
  //               newScores[tmc.id_tieumuccon] =
  //                 parsedSavedScores[tmc.id_tieumuccon] ?? 0;
  //             });
  //         }
  //       });
  //     });

  //     setEvaluationScores(newScores);
  //     localStorage.setItem('evaluationScores', JSON.stringify(newScores));
  //   }
  // }, [danhSachTieuChiTheoKhoa]);

  // useEffect(() => {
  //   if (danhSachTieuChiTheoKhoa.length > 0 && khoaPhong) {
  //     const storageKey = `evaluationScores_${khoaPhong}`;
  //     const savedScores = localStorage.getItem(storageKey);
  //     const parsedSavedScores = savedScores ? JSON.parse(savedScores) : {};

  //     const newScores: any = {};
  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (tieuMuc.cac_tieu_muc_con) {
  //           tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .forEach((tmc) => {
  //               newScores[tmc.id_tieumuccon] =
  //                 parsedSavedScores[tmc.id_tieumuccon] ?? 0;
  //             });
  //         }
  //       });
  //     });

  //     setEvaluationScores(newScores);
  //     localStorage.setItem(storageKey, JSON.stringify(newScores));
  //   }
  // }, [danhSachTieuChiTheoKhoa, khoaPhong]);

  // const handleDotChange = (selectedOption: any) => {
  //   const newDot = selectedOption?.value || '';
  //   setSelectedDot(newDot);
  //   console.log(newDot);

  //   // setLoadingDanhMuc(true);

  //   // // Lấy dữ liệu đánh giá của khoa được chọn
  //   // const storageKey = `evaluationScores_${newKhoaPhong}`;
  //   // const savedScores = localStorage.getItem(storageKey);
  //   // if (savedScores) {
  //   //   setEvaluationScores(JSON.parse(savedScores));
  //   // }

  //   // fetchDataTieuChiTheoKhoa(newKhoaPhong);
  //   // fetchDataTieuChiTheoKhoa(selectedOption?.value);
  // };

  // const handleDotChange = async (selectedOption: any) => {
  //   const newDot = selectedOption?.value || '';
  //   setSelectedDot(newDot);

  //   try {
  //     // Lấy dữ liệu đánh giá từ API
  //     const response = await axios.get(
  //       'http://172.16.0.60:883/api/danh_gia_khoa',
  //     );

  //     if (response.data) {
  //       // Tìm đánh giá khớp với khoa phòng và ngày được chọn
  //       const selectedEvaluation = response.data.find(
  //         (evaluation: any) =>
  //           evaluation.ten_khoa === khoaPhong &&
  //           formatDate(evaluation.ngay_gio_danh_gia) === newDot,
  //       );

  //       if (selectedEvaluation) {
  //         // Chuyển đổi dữ liệu đánh giá sang định dạng scores
  //         const newScores: Record<string, number> = {};

  //         selectedEvaluation.danh_sach_danh_gia.forEach((tieuChi: any) => {
  //           tieuChi.tieu_muc.forEach((tieuMuc: any) => {
  //             newScores[tieuMuc.id_tieumuc] = tieuMuc.danh_gia;
  //           });
  //         });

  //         // Cập nhật state evaluationScores
  //         setEvaluationScores(newScores);
  //       } else {
  //         // Xóa scores nếu không tìm thấy đánh giá phù hợp
  //         setEvaluationScores({});
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error('Lỗi khi tải dữ liệu đánh giá');
  //   }
  // };

  // const handleDotChange = async (selectedOption: any) => {
  //   const newDot = selectedOption?.value || '';
  //   setSelectedDot(newDot);

  //   try {
  //     const response = await axios.get(
  //       'http://172.16.0.60:883/api/danh_gia_khoa',
  //     );

  //     if (response.data) {
  //       const selectedEvaluation = response.data.find(
  //         (evaluation: any) =>
  //           evaluation.ten_khoa === khoaPhong &&
  //           formatDate(evaluation.ngay_gio_danh_gia) === newDot,
  //       );

  //       // Khởi tạo defaultScores với tất cả tiêu chí là 0 (Không đạt)
  //       const defaultScores: Record<string, number> = {};
  //       danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //         tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //           if (tieuMuc.cac_tieu_muc_con) {
  //             tieuMuc.cac_tieu_muc_con
  //               .filter((tmc) => tmc.hidden === 0)
  //               .forEach((tmc) => {
  //                 defaultScores[tmc.id_tieumuccon] = 0;
  //               });
  //           }
  //         });
  //       });

  //       // Nếu có đánh giá từ trước, cập nhật vào defaultScores
  //       if (selectedEvaluation) {
  //         selectedEvaluation.danh_sach_danh_gia.forEach((tieuChi: any) => {
  //           tieuChi.tieu_muc.forEach((tieuMuc: any) => {
  //             if (tieuMuc.cac_tieu_muc_con) {
  //               tieuMuc.cac_tieu_muc_con.forEach((tieuMucCon: any) => {
  //                 defaultScores[tieuMucCon.id_tieumuccon] = tieuMucCon.danh_gia;
  //               });
  //             }
  //           });
  //         });
  //       }

  //       setEvaluationScores(defaultScores);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error('Lỗi khi tải dữ liệu đánh giá');
  //   }
  // };

  // Lưu đánh giá vào localStorage khi có thay đổi
  useEffect(() => {
    if (selectedDot && Object.keys(evaluationScores).length > 0) {
      const storageKey = `evaluationScores_${khoaPhong}_${selectedDot}`;
      localStorage.setItem(storageKey, JSON.stringify(evaluationScores));
    }
  }, [evaluationScores, selectedDot, khoaPhong]);

  const handleDotChange = async (selectedOption: any) => {
    const newDot = selectedOption?.value || '';
    setSelectedDot(newDot);

    if (newDot) {
      // Get evaluation data
      const response = await DanhSachDanhGia();
      console.log(response);

      const selectedEvaluation = response.find(
        (danhGia: any) => formatDate(danhGia.ngay_gio_danh_gia) === newDot,
      );

      console.log(selectedEvaluation);

      // Check if any tieu_muc has danh_gia of 10 or 11
      const isLocked = selectedEvaluation?.danh_sach_danh_gia?.some(
        (danhGia: any) =>
          danhGia.tieu_muc.some(
            (tieuMuc: any) =>
              tieuMuc.danh_gia === 10 || tieuMuc.danh_gia === 11,
          ),
      );

      setIsEvaluationLocked(isLocked);

      const storageKey = `evaluationScores_${khoaPhong}_${newDot}`;
      const savedScores = localStorage.getItem(storageKey);

      if (savedScores) {
        setEvaluationScores(JSON.parse(savedScores));
      } else {
        const defaultScores: Record<string, number> = {};
        danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
          tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
            if (tieuMuc.cac_tieu_muc_con) {
              tieuMuc.cac_tieu_muc_con
                .filter((tmc) => tmc.hidden === 0)
                .forEach((tmc) => {
                  defaultScores[tmc.id_tieumuccon] = 0;
                });
            }
          });
        });
        setEvaluationScores(defaultScores);
      }
    } else {
      setEvaluationScores({});
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

  // Function to check if all required fields are filled
  // const isFormValid = () => {
  //   return selectedKhoaPhong;
  // };

  // const handleEvaluationChange = (id_tieumuccon: string, value: number) => {
  //   setEvaluationScores((prev) => {
  //     const newScores = {
  //       ...prev,
  //       [id_tieumuccon]: value,
  //     };

  //     // Tự động cập nhật đánh giá cho tiểu mục
  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (
  //           tieuMuc.cac_tieu_muc_con &&
  //           Array.isArray(tieuMuc.cac_tieu_muc_con)
  //         ) {
  //           const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .every((tmc) => newScores[tmc.id_tieumuccon] === 1);

  //           if (allTieuMucConDat) {
  //             newScores[tieuMuc.id_tieumuc] = 1;
  //           } else {
  //             newScores[tieuMuc.id_tieumuc] = 0;
  //           }
  //         }
  //       });
  //     });

  //     // Lưu vào localStorage
  //     localStorage.setItem('evaluationScores', JSON.stringify(newScores));

  //     return newScores;
  //   });
  // };

  // const luuDanhGia = async () => {
  //   try {
  //     const currentDate = new Date();

  //     const evaluationData = {
  //       danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
  //         id_tieuchi: tieuChi.id_tieuchi,
  //         tieu_muc: tieuChi.cac_tieu_muc
  //           .filter((tm) => tm.hidden === 0)
  //           .map((tieuMuc) => ({
  //             id_tieumuc: tieuMuc.id_tieumuc,
  //             danh_gia: evaluationScores[tieuMuc.id_tieumuc] || 0,
  //             // tieu_muc_con:
  //             //   tieuMuc.cac_tieu_muc_con &&
  //             //   Array.isArray(tieuMuc.cac_tieu_muc_con)
  //             //     ? tieuMuc.cac_tieu_muc_con
  //             //         .filter((tmc) => tmc.hidden === 0)
  //             //         .map((tieuMucCon) => ({
  //             //           id_tieumuccon: tieuMucCon.id_tieumuccon,
  //             //           danh_gia:
  //             //             evaluationScores[tieuMucCon.id_tieumuccon] || 0,
  //             //         }))
  //             //     : [],
  //           })),
  //       })),
  //       ngay_gio_danh_gia: currentDate.toUTCString(),
  //       nam: currentDate.getFullYear(),
  //       thang: currentDate.getMonth() + 1,
  //       ngay: currentDate.getDate(),
  //       gio: currentDate.getHours(),
  //       phut: currentDate.getMinutes(),
  //       giay: currentDate.getSeconds(),
  //       quy: Math.floor(currentDate.getMonth() / 3) + 1,
  //       ten_khoa: khoaPhong,
  //       nhan_vien: tenNhanVien,
  //     };

  //     await axios.post(
  //       'http://172.16.0.60:883/api/danh_gia_khoa',
  //       evaluationData,
  //     );

  //     // const response = await fetch('http://172.16.0.60:883/api/danh_gia_khoa', {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify(evaluationData),
  //     // });

  //     // if (!response.ok) {
  //     //   const errorData = await response.text();
  //     //   console.log('Error response:', errorData);
  //     //   throw new Error(
  //     //     `HTTP error! status: ${response.status}, message: ${errorData}`,
  //     //   );
  //     // }

  //     messageApi.success('Lưu đánh giá thành công');
  //     console.log(evaluationData);
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
  //   }
  // };

  // const handleEvaluationChange = (id_tieumuccon: string, value: number) => {
  //   setEvaluationScores((prev) => {
  //     const newScores = {
  //       ...prev,
  //       [id_tieumuccon]: value,
  //     };

  //     // Tự động cập nhật đánh giá cho tiểu mục
  //     danhSachTieuChiTheoKhoa.forEach((tieuChi) => {
  //       tieuChi.cac_tieu_muc.forEach((tieuMuc) => {
  //         if (
  //           tieuMuc.cac_tieu_muc_con &&
  //           Array.isArray(tieuMuc.cac_tieu_muc_con)
  //         ) {
  //           const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
  //             .filter((tmc) => tmc.hidden === 0)
  //             .every((tmc) => newScores[tmc.id_tieumuccon] === 1);

  //           if (allTieuMucConDat) {
  //             newScores[tieuMuc.id_tieumuc] = 1;
  //           } else {
  //             newScores[tieuMuc.id_tieumuc] = 0;
  //           }
  //         }
  //       });
  //     });

  //     // Lưu vào localStorage với key theo khoa phòng
  //     const storageKey = `evaluationScores_${khoaPhong}`;
  //     localStorage.setItem(storageKey, JSON.stringify(newScores));

  //     return newScores;
  //   });
  // };

  const handleEvaluationChange = (id_tieumuccon: string, value: number) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [id_tieumuccon]: value,
    }));
  };

  // const luuDanhGia = async () => {
  //   try {
  //     const currentDate = new Date();

  //     const evaluationData = {
  //       danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
  //         id_tieuchi: tieuChi.id_tieuchi,
  //         tieu_muc: tieuChi.cac_tieu_muc
  //           .filter((tm) => tm.hidden === 0)
  //           .map((tieuMuc) => ({
  //             id_tieumuc: tieuMuc.id_tieumuc,
  //             // Lấy giá trị đánh giá từ evaluationScores
  //             danh_gia: evaluationScores[tieuMuc.id_tieumuc] || 0,
  //             // tieu_muc_con:
  //             //   tieuMuc.cac_tieu_muc_con &&
  //             //   Array.isArray(tieuMuc.cac_tieu_muc_con)
  //             //     ? tieuMuc.cac_tieu_muc_con
  //             //         .filter((tmc) => tmc.hidden === 0)
  //             //         .map((tieuMucCon) => ({
  //             //           id_tieumuccon: tieuMucCon.id_tieumuccon,
  //             //           danh_gia:
  //             //             evaluationScores[tieuMucCon.id_tieumuccon] || 0,
  //             //         }))
  //             //     : [],
  //           })),
  //       })),
  //       ngay_gio_danh_gia: currentDate.toUTCString(),
  //       nam: currentDate.getFullYear(),
  //       thang: currentDate.getMonth() + 1,
  //       ngay: currentDate.getDate(),
  //       gio: currentDate.getHours(),
  //       phut: currentDate.getMinutes(),
  //       giay: currentDate.getSeconds(),
  //       quy: Math.floor(currentDate.getMonth() / 3) + 1,
  //       ten_khoa: khoaPhong,
  //       nhan_vien: tenNhanVien,
  //     };

  //     console.log(evaluationData);

  //     await axios.post(
  //       'http://172.16.0.60:883/api/danh_gia_khoa',
  //       evaluationData,
  //     );
  //     messageApi.success('Lưu đánh giá thành công');
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
  //   }
  // };

  // const luuDanhGia = async () => {
  //   try {
  //     const currentDate = new Date();
  //     const evaluationData = {
  //       danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
  //         id_tieuchi: tieuChi.id_tieuchi,
  //         tieu_muc: tieuChi.cac_tieu_muc
  //           .filter((tm) => tm.hidden === 0)
  //           .map((tieuMuc) => ({
  //             id_tieumuc: tieuMuc.id_tieumuc,
  //             danh_gia: evaluationScores[tieuMuc.id_tieumuc] || 0,
  //           })),
  //       })),
  //       ngay_gio_danh_gia: currentDate.toUTCString(),
  //       nam: currentDate.getFullYear(),
  //       thang: currentDate.getMonth() + 1,
  //       ngay: currentDate.getDate(),
  //       gio: currentDate.getHours(),
  //       phut: currentDate.getMinutes(),
  //       giay: currentDate.getSeconds(),
  //       quy: Math.floor(currentDate.getMonth() / 3) + 1,
  //       ten_khoa: khoaPhong,
  //       nhan_vien: tenNhanVien,
  //     };

  //     console.log(evaluationData);

  //     // await axios.post('http://172.16.0.60:883/api/danh_gia_khoa', evaluationData);
  //     // messageApi.success('Lưu đánh giá thành công');
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
  //   }
  // };

  // const printReport = () => {
  //   const printContent = document.createElement('div');
  //   printContent.innerHTML = `
  //     <h1 style="text-align: center">BÁO CÁO ĐÁNH GIÁ TIÊU CHÍ</h1>
  //     <p style="text-align: center">Khoa/Phòng: ${khoaPhong}</p>
  //     <p style="text-align: center">Đợt đánh giá: ${selectedDot}</p>
  //     <hr/>
  //     ${danhSachTieuChiTheoKhoa
  //       .map(
  //         (tieuChi) => `
  //       <div style="margin-bottom: 20px">
  //         <h3>Tiêu chí ${tieuChi.so_tieuchi}: ${tieuChi.ten_tieuchi}: ${
  //           tieuChi.mo_ta
  //         }</h3>
  //        // ${tieuChi.cac_tieu_muc
  //          .filter((tm) => tm.hidden === 0)
  //          .map(
  //            (tieuMuc) => `
  //   <div style="margin-left: 20px">
  //     <h4>Tiểu mục ${tieuMuc.so_tieu_muc}: ${tieuMuc.ten_tieu_muc}: ${
  //       tieuMuc.mo_ta_tieu_muc
  //     }</h4>
  //     ${tieuMuc.cac_tieu_muc_con
  //       ?.filter((tmc) => tmc.hidden === 0)
  //       .map(
  //         (tieuMucCon) => `
  //       <div style="margin-left: 40px">
  //         <p>${tieuMucCon.so_tieu_muc_con}. ${tieuMucCon.mo_ta_tieu_muc_con}</p>
  //         <p>Kết quả: ${
  //           evaluationScores[tieuMucCon.id_tieumuccon] === 1
  //             ? 'Đạt'
  //             : 'Không đạt'
  //         }</p>
  //       </div>
  //     `,
  //       )
  //       .join('')}
  //   </div>
  // `,
  //          )
  //          .join('')}
  //       </div>
  //     `,
  //       )
  //       .join('')}
  //   `;

  //   const printWindow = window.open('', '', 'height=600,width=800');
  //   printWindow?.document.write('<html><head><title>Báo cáo đánh giá</title>');
  //   printWindow?.document.write('</head><body>');
  //   printWindow?.document.write(printContent.innerHTML);
  //   printWindow?.document.write('</body></html>');
  //   printWindow?.document.close();
  //   printWindow?.print();
  // };

  const printReport = async () => {
    try {
      // Fetch evaluation data
      const response = await DanhSachDanhGia();
      const danhGiaData = response.find(
        (danhGia: any) => formatDate(danhGia.ngay_gio_danh_gia) === selectedDot,
      );

      const printContent = document.createElement('div');
      printContent.innerHTML = `
        <h1 style="text-align: center">BÁO CÁO ĐÁNH GIÁ TIÊU CHÍ</h1>
        <p style="text-align: center">Khoa/Phòng: ${khoaPhong}</p>
        <p style="text-align: center">Đợt đánh giá: ${selectedDot}</p>
        <hr/>
        ${danhSachTieuChiTheoKhoa
          .map((tieuChi) => {
            // Find corresponding evaluation data for this tieuChi
            const tieuChiDanhGia = danhGiaData?.danh_sach_danh_gia.find(
              (tc: any) => tc.id_tieuchi === tieuChi.id_tieuchi,
            );

            // Check if all tiểu mục have danh_gia = 1
            const allTieuMucDat = tieuChiDanhGia?.tieu_muc.every(
              (tm: any) => tm.danh_gia === 1,
            );

            return `
              <div style="margin-bottom: 20px">
                <h3>Tiêu chí ${tieuChi.so_tieuchi}: ${tieuChi.ten_tieuchi}</h3>
                <p>Mô tả: ${tieuChi.mo_ta}</p>
                <p><strong>Kết quả: ${
                  allTieuMucDat ? 'Đạt' : 'Không đạt'
                }</strong></p>
                
              </div>
            `;
          })
          .join('')}
      `;

      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow?.document.write(
        '<html><head><title>Báo cáo đánh giá</title>',
      );
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi tạo báo cáo');
    }
  };

  // ${tieuChi.cac_tieu_muc
  //   .filter(tm => tm.hidden === 0)
  //   .map(tieuMuc => {
  //     const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
  //       ?.filter(tmc => tmc.hidden === 0)
  //       ?.every(tmc => evaluationScores[tmc.id_tieumuccon] === 1);

  //     return `
  //       <div style="margin-left: 20px">
  //         <h4>Tiểu mục ${tieuMuc.so_tieu_muc}: ${tieuMuc.ten_tieu_muc}</h4>
  //         <p>Mô tả: ${tieuMuc.mo_ta_tieu_muc}</p>
  //         <p><strong>Kết quả: ${allTieuMucConDat ? 'Đạt' : 'Không đạt'}</strong></p>
  //       </div>
  //     `;
  //   }).join('')}

  const luuChoDanhGiaMoi = async () => {
    try {
      const currentDate = new Date();
      const evaluationData = {
        danh_sach_danh_gia: danhSachTieuChiTheoKhoa.map((tieuChi) => ({
          id_tieuchi: tieuChi.id_tieuchi,
          tieu_muc: tieuChi.cac_tieu_muc
            .filter((tm) => tm.hidden === 0)
            .map((tieuMuc) => {
              // Kiểm tra tất cả tiểu mục con có đạt không
              const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
                ?.filter((tmc) => tmc.hidden === 0)
                ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

              return {
                id_tieumuc: tieuMuc.id_tieumuc,
                danh_gia: allTieuMucConDat ? 1 : 0,
                cac_tieu_muc_con: tieuMuc.cac_tieu_muc_con
                  ?.filter((tmc) => tmc.hidden === 0)
                  ?.map((tmc) => ({
                    id_tieumuccon: tmc.id_tieumuccon,
                    danh_gia: evaluationScores[tmc.id_tieumuccon] || 0,
                  })),
              };
            }),
        })),
        ngay_gio_danh_gia: currentDate.toUTCString(),
        nam: currentDate.getFullYear(),
        thang: currentDate.getMonth() + 1,
        ngay: currentDate.getDate(),
        gio: currentDate.getHours(),
        phut: currentDate.getMinutes(),
        giay: currentDate.getSeconds(),
        quy: Math.floor(currentDate.getMonth() / 3) + 1,
        ten_khoa: khoaPhong,
        nhan_vien: tenNhanVien,
      };

      // await axios.post(
      //   'http://172.16.0.60:883/api/danh_gia_khoa',
      //   evaluationData,
      // );

      await ThemMoiDanhGia(evaluationData);
      setStatus('Saved');
      messageApi.success('Thêm đánh giá cho đợt mới thành công');
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi lưu đánh giá');
    }
  };

  const luuChoDanhGiaNay = async () => {
    try {
      // const response = await axios.get(
      //   'http://172.16.0.60:883/api/danh_gia_khoa',
      // );

      const response = await DanhSachDanhGia();

      const danhSachDanhGia = response;

      const danhGiaCanTim = danhSachDanhGia.find(
        (danhGia: any) => formatDate(danhGia.ngay_gio_danh_gia) === selectedDot,
      );

      if (!danhGiaCanTim) {
        messageApi.error('Không tìm thấy đợt đánh giá');
        return;
      }

      // Cập nhật từng tiêu mục
      for (const tieuChi of danhSachTieuChiTheoKhoa) {
        for (const tieuMuc of tieuChi.cac_tieu_muc) {
          // Tìm id_danhgia_tieumuc tương ứng
          const danhGiaTieuMuc = danhGiaCanTim.danh_sach_danh_gia
            .find((tc: any) => tc.id_tieuchi === tieuChi.id_tieuchi)
            ?.tieu_muc.find((tm: any) => tm.id_tieumuc === tieuMuc.id_tieumuc);

          if (danhGiaTieuMuc) {
            // Kiểm tra tất cả tiểu mục con có đạt không từ evaluationScores
            const allTieuMucConDat = tieuMuc.cac_tieu_muc_con
              ?.filter((tmc) => tmc.hidden === 0)
              ?.every((tmc) => evaluationScores[tmc.id_tieumuccon] === 1);

            const updateData = {
              id_danhgia_tieumuc: danhGiaTieuMuc.id_danhgia_tieumuc,
              danh_gia: allTieuMucConDat ? 1 : 0,
            };
            console.log(updateData);

            // await axios.put(
            //   'http://172.16.0.60:883/api/cap_nhat_danhgia_tieu_muc',
            //   updateData,
            // );

            await CapNhatDanhGia(updateData);
          }
        }
      }

      setStatus('Updated');
      messageApi.success('Cập nhật đánh giá thành công');
    } catch (error) {
      console.error(error);
      messageApi.error('Đã có lỗi xảy ra khi cập nhật đánh giá');
    }
  };

  return (
    <>
      {contextHolder}
      {khoaPhong !== 'Phòng Quản Lý chất lượng' ? (
        <>
          <div className="container">
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Đánh giá tiêu chí {khoaPhong}
            </div>
            <br />
            <div>
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
              />
            </div>
            <br />
            {/* {isFormValid() && ( */}
            {selectedDot && (
              <>
                {/* <button
              title="Lưu đánh giá"
              className={`bg-primary mr-2 p-2 font-medium text-gray hover:bg-opacity-90  `}
              onClick={luuChoDanhGiaNay}
            >
              Cập nhật cho đợt này
            </button> */}
                <button
                  title={
                    isEvaluationLocked
                      ? `Không thể lưu do đánh giá đã bị khóa. Vui lòng liên hệ QLCL để mở khóa đánh giá`
                      : `Lưu đánh giá`
                  }
                  className={`bg-primary mr-2 p-2 font-medium text-gray hover:bg-opacity-90 ${
                    isEvaluationLocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={luuChoDanhGiaNay}
                  disabled={isEvaluationLocked}
                >
                  Cập nhật cho đợt này
                </button>
                <button
                  title="Lưu đánh giá"
                  className={`bg-primary mr-2 p-2 font-medium text-gray hover:bg-opacity-90  `}
                  onClick={luuChoDanhGiaMoi}
                >
                  Thêm đánh giá này vào đợt mới
                </button>
                <button
                  title="In báo cáo"
                  className="bg-success mr-2 p-2 font-medium text-gray hover:bg-opacity-90"
                  onClick={printReport}
                >
                  In báo cáo
                </button>
                {/* )} */}
                <br />
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
                                      defaultValue={
                                        existingData?.ten_tieuchi || ''
                                      }
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
                                                          {
                                                            item?.so_tieu_muc_con
                                                          }
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
                                                            style={{
                                                              width: '8%',
                                                            }}
                                                          />
                                                          <input
                                                            type="text"
                                                            placeholder="Tên Tiểu mục con"
                                                            id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                                            style={{
                                                              width: '10%',
                                                            }}
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
                                                            style={{
                                                              width: '10%',
                                                            }}
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
                                                              overflow:
                                                                'hidden',
                                                              verticalAlign:
                                                                'middle',
                                                              padding:
                                                                '10px 10px',
                                                              lineHeight: '1.5',
                                                              border:
                                                                '1px solid #ced4da',
                                                              borderRadius:
                                                                '0.25rem',
                                                            }}
                                                            placeholder="Nội dung Tiểu mục con"
                                                            readOnly
                                                          ></textarea>
                                                          {/* <select
                                                    value={
                                                      evaluationScores[
                                                        item.id_tieumuccon
                                                      ] || 0
                                                    }
                                                    onChange={(e) =>
                                                      handleEvaluationChange(
                                                        item.id_tieumuccon,
                                                        parseInt(
                                                          e.target.value,
                                                        ),
                                                      )
                                                    }
                                                    className="rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                  >
                                                    <option value="0">
                                                      Không đạt
                                                    </option>
                                                    <option value="1">
                                                      Đạt
                                                    </option>
                                                  </select> */}

                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              evaluationScores[
                                                                item
                                                                  .id_tieumuccon
                                                              ] === 1
                                                            }
                                                            onChange={(e) => {
                                                              if (
                                                                e.target.checked
                                                              ) {
                                                                handleEvaluationChange(
                                                                  item.id_tieumuccon,
                                                                  1,
                                                                );
                                                              }
                                                            }}
                                                            disabled={
                                                              isEvaluationLocked
                                                            }
                                                            className="h-5 w-5 ml-2 cursor-pointer rounded border-[1.5px] border-stroke bg-transparent accent-primary"
                                                          />
                                                          <label className="ml-2 text-black">
                                                            Đạt
                                                          </label>

                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              evaluationScores[
                                                                item
                                                                  .id_tieumuccon
                                                              ] === 0
                                                            }
                                                            onChange={(e) => {
                                                              if (
                                                                e.target.checked
                                                              ) {
                                                                handleEvaluationChange(
                                                                  item.id_tieumuccon,
                                                                  0,
                                                                );
                                                              }
                                                            }}
                                                            disabled={
                                                              isEvaluationLocked
                                                            }
                                                            className="h-5 w-5 ml-3 cursor-pointer rounded border-[1.5px] border-stroke bg-transparent accent-primary"
                                                          />
                                                          <label className="ml-2 text-black">
                                                            Không đạt
                                                          </label>
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

export default DanhGiaTieuChiKhoaPhong;
