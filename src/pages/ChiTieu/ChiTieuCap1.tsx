import { useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Popconfirm } from 'antd';
import {
  DeleteFilled,
  LoadingOutlined,
  PlusCircleFilled,
  QuestionCircleOutlined,
  SaveFilled,
} from '@ant-design/icons';
import { DanhMuc } from '../../types/danhmuc';
import {
  DanhSachDanhMuc,
  LuuTieuChiCu,
  LuuTieuChiMoi,
  LuuTieuMucConCu,
  LuuTieuMucConMoi,
  LuuTieuMucCu,
  LuuTieuMucMoi,
  ThemTieuMucCon,
} from '../../api/ChiTieuAPI';

const ChiTieuCap1: React.FC = () => {
  const [dataTieuChi, setDataTieuChi] = useState<DanhMuc[]>([]);

  const [level1Count] = useState<number>(83);

  const [status, setStatus] = useState<string>('');

  const [forceUpdate, setForceUpdate] = useState(0);

  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

  const [loadingTieuMucConButtons, setLoadingTieuMucConButtons] = useState<
    Record<string, string | null>
  >({});

  const [loadingTieuMucButtons, setLoadingTieuMucButtons] = useState<
    Record<string, string | null>
  >({});

  const [loadingTieuChiButtons, setLoadingTieuChiButtons] = useState<
    Record<string, string | null>
  >({});

  const [messageApi, contextHolder] = message.useMessage();

  // Hàm so sánh để sắp xếp so_tieu_muc_con
  function compareSoTieuMucCon(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      if (aParts[i] === undefined) return -1;
      if (bParts[i] === undefined) return 1;
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
    }
    return 0;
  }

  // Hàm sắp xếp danh sách tiểu mục con
  function sortTieuMucCon(tieuMucConList: any[]): any[] {
    return tieuMucConList.sort((a, b) =>
      compareSoTieuMucCon(a.so_tieu_muc_con, b.so_tieu_muc_con),
    );
  }

  // Hàm sắp xếp toàn bộ cấu trúc dữ liệu
  function sortEntireStructure(data: any): any {
    return data.danh_muc.map((danhMuc: any) => ({
      ...danhMuc,
      cac_tieu_muc: danhMuc.cac_tieu_muc.map((tieuMuc: any) => ({
        ...tieuMuc,
        cac_tieu_muc_con: sortTieuMucCon(tieuMuc.cac_tieu_muc_con),
      })),
    }));
  }

  useEffect(() => {
    const fetchDataTieuChi = async () => {
      try {
        let data = await DanhSachDanhMuc();
        if (data) {
          // Sắp xếp toàn bộ cấu trúc dữ liệu

          const sortedData = sortEntireStructure(data);
          setDataTieuChi(sortedData);

          setLoadingDanhMuc(false);
          setStatus('Fetch');
        }
      } catch (error) {
        console.log(error);
        messageApi.open({
          type: 'error',
          content: `Đã có lỗi xảy ra trong quá trình hiển thị dữ liệu.`,
        });
      }
    };
    fetchDataTieuChi();
  }, [status]);

  const luuTieuChi = async (level1Id: number) => {
    const tenTieuchi = (
      document.getElementById(
        `ten-tieuchi-cap1-${level1Id}`,
      ) as HTMLInputElement
    )?.value;
    const noidungTieuchi = (
      document.getElementById(
        `noidung-tieuchi-cap1-${level1Id}`,
      ) as HTMLInputElement
    )?.value;

    if (tenTieuchi?.trim() !== '' && noidungTieuchi?.trim() !== '') {
      const tieuchiDataPost = {
        so_tieuchi: level1Id,
        ten_tieuchi: tenTieuchi,
        mo_ta: noidungTieuchi,
        cac_tieu_muc: [],
        hidden: 0,
      };

      const tieuchiDataPut = {
        so_tieuchi: level1Id,
        ten_tieuchi: tenTieuchi,
        mo_ta: noidungTieuchi,
        hidden: 0,
      };
      const key = level1Id;
      setLoadingTieuChiButtons((prev) => ({ ...prev, [key]: 'luutieuchi' }));
      try {
        let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
        if (existingData) {
          await LuuTieuChiCu(tieuchiDataPut, existingData?.id_tieuchi);

          setStatus('TieuChi');
        } else {
          await LuuTieuChiMoi(tieuchiDataPost);

          setStatus('TieuChi');
        }
        messageApi.open({
          type: 'success',
          content: `Tiêu chí số ${level1Id} đã được lưu.`,
        });
      } catch (error) {
        messageApi.open({
          type: 'error',
          content: `Đã có lỗi xảy ra khi lưu tiêu chí. Vui lòng thử lại.`,
        });
      } finally {
        setLoadingTieuChiButtons((prev) => ({ ...prev, [key]: null }));
      }
    } else {
      messageApi.open({
        type: 'error',
        content: `Vui lòng nhập đầy đủ thông tin tiêu chí.`,
      });
    }
  };

  const incrementLastNumber = (str: any) => {
    const parts = str.split('.').map(Number);
    parts[parts.length - 1]++;
    return parts.join('.');
  };

  const compareVersions = (a: any, b: any) => {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA > numB) return 1;
      if (numA < numB) return -1;
    }
    return 0;
  };

  const compareVersionsTieuMuc = (
    a: string | number,
    b: string | number,
  ): number => {
    const parseVersion = (v: string | number): number[] => {
      if (typeof v === 'number') {
        v = v.toString();
      }
      return v.split('.').map((part) => parseInt(part, 10));
    };

    const partsA = parseVersion(a);
    const partsB = parseVersion(b);
    const maxLength = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < maxLength; i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA > numB) return 1;
      if (numA < numB) return -1;
    }
    return 0;
  };

  const incrementLastNumberTieuMuc = (str: string | number): string => {
    if (typeof str === 'number') {
      str = str.toString();
    }
    const parts = str.split('.');
    let lastPart = parseInt(parts[parts.length - 1], 10) + 1;
    parts[parts.length - 1] = lastPart.toString();
    return parts.join('.');
  };

  const findNextAvailableSoTieuMuc = (
    existingData: any[],
    level1Id: number,
  ): string => {
    let maxSoTieuMuc = `${level1Id}.0`;
    const usedSoTieuMuc = new Set();

    for (const item of existingData) {
      const soTieuMuc = item.so_tieu_muc.toString();
      usedSoTieuMuc.add(soTieuMuc);
      if (compareVersionsTieuMuc(soTieuMuc, maxSoTieuMuc) > 0) {
        maxSoTieuMuc = soTieuMuc;
      }
    }

    let newSoTieuMuc = incrementLastNumberTieuMuc(maxSoTieuMuc);
    while (usedSoTieuMuc.has(newSoTieuMuc)) {
      newSoTieuMuc = incrementLastNumberTieuMuc(newSoTieuMuc);
    }

    return newSoTieuMuc;
  };

  const themTieuMuc = async (level1Id: number) => {
    const key = level1Id;
    setLoadingTieuChiButtons((prev) => ({ ...prev, [key]: 'themtieumuc' }));
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        const newSoTieuMuc = findNextAvailableSoTieuMuc(
          existingData.cac_tieu_muc.filter((tm) => tm.hidden === 0),
          level1Id,
        );

        // Kiểm tra xem số tiểu mục mới đã tồn tại chưa
        const existingTieuMuc = existingData.cac_tieu_muc.find(
          (tm) => tm.so_tieu_muc === newSoTieuMuc && tm.hidden === 0,
        );

        if (existingTieuMuc) {
          const newTieuMuc = {
            so_tieu_muc: newSoTieuMuc,
            ten_tieu_muc: '',
            mo_ta_tieu_muc: '',
            diem_toi_da: '',
            cac_tieu_muc_con: [],
            hidden: 0,
          };
          await LuuTieuMucMoi(newTieuMuc, existingData?.id_tieuchi);
        } else {
          // Nếu chưa tồn tại, tạo mới như bình thường
          const tieumucDataPost = {
            so_tieu_muc: newSoTieuMuc,
            ten_tieu_muc: '',
            mo_ta_tieu_muc: '',
            diem_toi_da: '',
            cac_tieu_muc_con: [],
            hidden: 0,
          };
          await LuuTieuMucMoi(tieumucDataPost, existingData?.id_tieuchi);
        }

        setStatus('ThemTieuMuc');
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi thêm tiểu mục. Vui lòng thử lại.`,
      });
    } finally {
      setLoadingTieuChiButtons((prev) => ({ ...prev, [key]: null }));
    }
  };

  const luuTieuMuc = async (
    level1Id: number,
    level2Id: number,
    sotieumuc: string | undefined,
  ) => {
    const tenTieumuc = (
      document.getElementById(
        `ten-tieumuc-cap2-${level1Id}-${level2Id}`,
      ) as HTMLInputElement
    )?.value;
    const noidungTieumuc = (
      document.getElementById(
        `noidung-tieumuc-cap2-${level1Id}-${level2Id}`,
      ) as HTMLInputElement
    )?.value;

    if (!sotieumuc) {
      messageApi.open({
        type: 'error',
        content: `Số tiểu mục không tìm thấy. Vui lòng thử lại`,
      });

      return;
    }

    if (tenTieumuc?.trim() !== '' && noidungTieumuc?.trim() !== '') {
      const key = sotieumuc;
      setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: 'luutieumuc' }));
      try {
        let existingData1 = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        let existingData2 = existingData1?.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === sotieumuc,
        );
        if (existingData2) {
          const tieumucDataPut = {
            so_tieu_muc: existingData2?.so_tieu_muc,
            ten_tieu_muc: tenTieumuc,
            mo_ta_tieu_muc: noidungTieumuc,
            diem_toi_da: '',
            hidden: 0,
            id_tieumuc: existingData2?.id_tieumuc,
            cac_tieu_muc_con: existingData2?.cac_tieu_muc_con
              ? existingData2?.cac_tieu_muc_con
              : [],
          };

          await LuuTieuMucCu(tieumucDataPut, existingData2?.id_tieumuc);
          setStatus('TieuMuc');
        } else {
          // await LuuTieuMucMoi(tieumucDataPost, level1Id);
          // setStatus('TieuMuc');
          console.log('TieuMuc');
        }
        messageApi.open({
          type: 'success',
          content: `Tiểu mục số ${sotieumuc} đã được lưu.`,
        });
      } catch (error) {
        messageApi.open({
          type: 'error',
          content: `Đã có lỗi xảy ra khi lưu tiểu mục. Vui lòng thử lại.`,
        });
      } finally {
        setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: null }));
      }
    } else {
      messageApi.open({
        type: 'error',
        content: `Vui lòng nhập đầy đủ thông tin tiểu mục.`,
      });
    }
  };

  const themTieuMucCon = async (sotieuchi: number, sotieumuc: string) => {
    const key = sotieumuc;
    setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: 'themtieumuccon' }));
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === sotieuchi);
      if (existingData) {
        let existingData2 = existingData.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === sotieumuc,
        );

        if (existingData2) {
          if (existingData2.cac_tieu_muc_con.length <= 0) {
            const tieumucconDataPost = {
              so_tieu_muc_con: `${existingData2.so_tieu_muc}.${1}`,
              ten_tieu_muc_con: '',
              mo_ta_tieu_muc_con: '',
              diem_toi_da: '',
              muc: '',
              hidden: 0,
            };

            await ThemTieuMucCon(
              tieumucconDataPost,
              existingData?.id_tieuchi,
              existingData2?.id_tieumuc,
            );
            setStatus('ThemTieuMucCon');
          } else {
            const maxSoTieuMucCon = existingData2.cac_tieu_muc_con.reduce(
              (max, tm) => {
                return compareVersions(tm.so_tieu_muc_con, max) > 0
                  ? tm.so_tieu_muc_con
                  : max;
              },
              '0',
            );

            const newSoTieuMucCon = incrementLastNumber(maxSoTieuMucCon);

            const tieumucconDataPostExisting = {
              so_tieu_muc_con: newSoTieuMucCon,
              ten_tieu_muc_con: '',
              mo_ta_tieu_muc_con: '',
              diem_toi_da: '',
              muc: '',
              hidden: 0,
            };

            await ThemTieuMucCon(
              tieumucconDataPostExisting,
              existingData?.id_tieuchi,
              existingData2?.id_tieumuc,
            );
            setStatus('ThemTieuMucCon');
          }
        } else {
          throw new Error('Không tìm thấy tiêu mục cấp 2');
        }
      } else {
        throw new Error('Không tìm thấy tiêu chí cấp 1');
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi thêm tiểu mục con. Vui lòng thử lại.`,
      });
    } finally {
      setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: null }));
    }
  };

  const chenThemTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    currentSoTieuMucCon: string,
  ) => {
    const key = currentSoTieuMucCon;
    setLoadingTieuMucConButtons((prev) => ({
      ...prev,
      [key]: 'chenthemtieumuccon',
    }));
    try {
      let existingData = dataTieuChi.find(
        (tc: any) => tc.so_tieuchi === level1Id,
      );
      if (existingData) {
        let existingData2: any = existingData.cac_tieu_muc.find(
          (tc: any) =>
            tc.so_tieu_muc === `${existingData?.so_tieuchi}.${level2Id}`,
        );

        if (existingData2) {
          const currentIndex = existingData2.cac_tieu_muc_con.findIndex(
            (tmc: any) =>
              tmc.so_tieu_muc_con === currentSoTieuMucCon && tmc.hidden === 0,
          );

          let newSoTieuMucCon = incrementLastNumber(currentSoTieuMucCon);
          const nextTieuMucCon = existingData2.cac_tieu_muc_con.filter(
            (tmc: any) => tmc.hidden === 0,
          )[currentIndex + 1];

          if (
            nextTieuMucCon &&
            nextTieuMucCon.so_tieu_muc_con === newSoTieuMucCon
          ) {
            // Nếu số tiếp theo đã tồn tại, cập nhật các số phía sau
            const updatePromises = existingData2.cac_tieu_muc_con
              .filter((tmc: any) => tmc.hidden === 0)
              .slice(currentIndex + 1)
              .map((tmc: any) => {
                const updatedSoTieuMucCon = incrementLastNumber(
                  tmc.so_tieu_muc_con,
                );
                return LuuTieuMucConCu(
                  { ...tmc, so_tieu_muc_con: updatedSoTieuMucCon },
                  tmc.id_tieumuccon,
                );
              });
            await Promise.all(updatePromises);
          }

          const newTieuMucCon = {
            so_tieu_muc_con: newSoTieuMucCon,
            ten_tieu_muc_con: '',
            mo_ta_tieu_muc_con: '',
            diem_toi_da: '',
            muc: '',
            hidden: 0,
          };

          // Thêm tiểu mục con mới
          const addedTieuMucCon: any = await LuuTieuMucConMoi(
            newTieuMucCon,
            existingData?.id_tieuchi,
            existingData2?.id_tieumuc,
          );

          // Thêm kiểm tra
          const newTieuMucConWithId =
            addedTieuMucCon && addedTieuMucCon.id_tieumuccon
              ? {
                  ...newTieuMucCon,
                  id_tieumuccon: addedTieuMucCon.id_tieumuccon,
                }
              : newTieuMucCon;

          // Cập nhật state
          setDataTieuChi((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const tieuChi = newData.find(
              (tc: any) => tc.so_tieuchi === level1Id,
            );
            if (tieuChi) {
              const tieuMuc = tieuChi.cac_tieu_muc.find(
                (tm: any) =>
                  tm.so_tieu_muc === `${existingData?.so_tieuchi}.${level2Id}`,
              );
              if (tieuMuc) {
                if (
                  nextTieuMucCon &&
                  nextTieuMucCon.so_tieu_muc_con === newSoTieuMucCon
                ) {
                  tieuMuc.cac_tieu_muc_con = tieuMuc.cac_tieu_muc_con.map(
                    (tmc: any, index: number) => {
                      if (index > currentIndex) {
                        return {
                          ...tmc,
                          so_tieu_muc_con: incrementLastNumberChen(
                            tmc.so_tieu_muc_con,
                          ),
                        };
                      }
                      return tmc;
                    },
                  );
                }
                // Sử dụng newTieuMucConWithId thay vì truy cập trực tiếp addedTieuMucCon.id_tieumuccon
                tieuMuc.cac_tieu_muc_con
                  .filter((tmc: any) => tmc.hidden === 0)
                  .splice(currentIndex + 1, 0, newTieuMucConWithId);
              }
            }
            return newData;
          });

          setForceUpdate(Date.now());
          setStatus('ChenThemTieuMucCon');
        }
      }
    } catch (error) {
      console.error('Error inserting tieu muc con:', error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi chèn tiểu mục con. Vui lòng thử lại.`,
      });
    } finally {
      setLoadingTieuMucConButtons((prev) => ({ ...prev, [key]: null }));
    }
  };

  const incrementLastNumberChen = (str: string): string => {
    const parts = str.split('.');
    const lastPart = parseInt(parts[parts.length - 1]) + 1;
    parts[parts.length - 1] = lastPart.toString();
    return parts.join('.');
  };

  const luuTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    level3Id: number,
    sotieumuc: string,
    sotieumuccon: string,
  ) => {
    const tenTieumuccon = (
      document.getElementById(
        `ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`,
      ) as HTMLInputElement
    )?.value;
    const noidungTieumuccon = (
      document.getElementById(
        `noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`,
      ) as HTMLInputElement
    )?.value;
    const mucTieumuccon = (
      document.getElementById(
        `muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`,
      ) as HTMLInputElement
    )?.value;

    if (
      tenTieumuccon?.trim() !== '' &&
      noidungTieumuccon?.trim() !== '' &&
      mucTieumuccon?.trim() !== ''
    ) {
      const key = sotieumuccon;
      setLoadingTieuMucConButtons((prev) => ({
        ...prev,
        [key]: 'luutieumuccon',
      }));
      try {
        let existingData1: DanhMuc | undefined = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        if (!existingData1) {
          throw new Error('Không tìm thấy tiêu chí');
        }

        let existingData2: any = existingData1.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === sotieumuc,
        );

        if (!existingData2) {
          throw new Error('Không tìm thấy tiêu mục');
        }

        let existingData3 = existingData2.cac_tieu_muc_con.find(
          (tc: any) => tc.so_tieu_muc_con === `${sotieumuccon}`,
        );

        if (existingData3) {
          const tieumucconDataPut = {
            so_tieu_muc_con: existingData3?.so_tieu_muc_con,
            ten_tieu_muc_con: tenTieumuccon,
            mo_ta_tieu_muc_con: noidungTieumuccon,
            muc: mucTieumuccon,
            diem_toi_da: '',
            hidden: 0,
            id_tieumuccon: existingData3?.id_tieumuccon,
          };

          await LuuTieuMucConCu(
            tieumucconDataPut,
            existingData3?.id_tieumuccon,
          );
          setStatus('TieuMucCon');
        }
        messageApi.open({
          type: 'success',
          content: `Tiểu mục con số ${existingData3?.so_tieu_muc_con} đã được lưu.`,
        });
      } catch (error) {
        console.error('Error saving tieu chi:', error);
        messageApi.open({
          type: 'error',
          content: `Đã có lỗi xảy ra khi lưu tiểu mục con. Vui lòng thử lại.`,
        });
      } finally {
        setLoadingTieuMucConButtons((prev) => ({ ...prev, [key]: null }));
      }
    } else {
      messageApi.open({
        type: 'error',
        content: `Vui lòng nhập đầy đủ thông tin tiểu mục con.`,
      });
    }
  };
  const xoaTieuMuc = async (
    level1Id: number,
    sotieumuc: string,
    id_tieumuc: string,
  ) => {
    const key = sotieumuc;
    setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: 'xoatieumuc' }));
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        // Đánh dấu tiểu mục là ẩn
        const tieumucToHide = existingData.cac_tieu_muc.find(
          (tm) => tm.id_tieumuc === id_tieumuc,
        );
        if (tieumucToHide) {
          await LuuTieuMucCu(
            {
              ...tieumucToHide,
              hidden: 1,
              so_tieu_muc: tieumucToHide.id_tieumuc,
            },
            tieumucToHide.id_tieumuc,
          );

          // Lấy các tiểu mục còn hiển thị và nằm sau tiểu mục vừa xóa
          const remainingTieuMuc = existingData.cac_tieu_muc.filter(
            (tm) => tm.so_tieu_muc > sotieumuc && tm.hidden === 0,
          );

          // Nếu có tiểu mục nằm dưới, cập nhật số của chúng
          if (remainingTieuMuc.length > 0) {
            const updatePromises = remainingTieuMuc.map((tm) => {
              const parts = tm.so_tieu_muc.split('.');
              parts[parts.length - 1] = (
                parseInt(parts[parts.length - 1]) - 1
              ).toString();
              const newSoTieuMuc = parts.join('.');

              return LuuTieuMucCu(
                { ...tm, so_tieu_muc: newSoTieuMuc },
                tm.id_tieumuc,
              );
            });

            await Promise.all(updatePromises);
          } else {
            await LuuTieuMucCu(
              {
                ...tieumucToHide,
                hidden: 1,
                so_tieu_muc: tieumucToHide.id_tieumuc,
              },
              tieumucToHide.id_tieumuc,
            );
          }

          // Cập nhật state
          setDataTieuChi((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const tieuChi = newData.find(
              (tc: any) => tc.so_tieuchi === level1Id,
            );
            if (tieuChi) {
              // Ẩn tiểu mục đã xóa
              const indexToHide = tieuChi.cac_tieu_muc.findIndex(
                (tm: any) => tm.so_tieu_muc === sotieumuc,
              );
              if (indexToHide !== -1) {
                tieuChi.cac_tieu_muc[indexToHide].hidden = 1;
                tieuChi.cac_tieu_muc[indexToHide].so_tieu_muc =
                  tieuChi.cac_tieu_muc[indexToHide].id_tieumuc;
                // Cập nhật số cho các tiểu mục còn lại
                for (
                  let i = indexToHide + 1;
                  i < tieuChi.cac_tieu_muc.length;
                  i++
                ) {
                  if (tieuChi.cac_tieu_muc[i].hidden === 0) {
                    const parts =
                      tieuChi.cac_tieu_muc[i].so_tieu_muc.split('.');
                    parts[parts.length - 1] = (
                      parseInt(parts[parts.length - 1]) - 1
                    ).toString();
                    tieuChi.cac_tieu_muc[i].so_tieu_muc = parts.join('.');
                  }
                }
              }
            }
            return newData;
          });

          setForceUpdate(Date.now());
          setStatus('DeleteTieuMuc');
          messageApi.open({
            type: 'success',
            content: `Tiểu mục ${sotieumuc} đã được xóa`,
          });
        }
      }
    } catch (error) {
      console.error('Error deleting tieu muc:', error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi xóa tiểu mục. Vui lòng thử lại.`,
      });
    } finally {
      setLoadingTieuMucButtons((prev) => ({ ...prev, [key]: null }));
    }
  };

  const xoaTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    sotieumuccon: string,
    id_tieumuccon: string,
  ) => {
    const key = sotieumuccon;
    setLoadingTieuMucConButtons((prev) => ({
      ...prev,
      [key]: 'xoatieumuccon',
    }));
    try {
      let sotieumuc = `${level1Id}.${level2Id}`;

      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        let existingData2 = existingData.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === sotieumuc,
        );

        if (existingData2) {
          // Đánh dấu tiểu mục con là ẩn
          const tieumucconToHide = existingData2.cac_tieu_muc_con.find(
            (tmc) => tmc.id_tieumuccon === id_tieumuccon,
          );
          if (tieumucconToHide) {
            await LuuTieuMucConCu(
              {
                ...tieumucconToHide,
                hidden: 1,
                so_tieu_muc_con: tieumucconToHide.id_tieumuccon,
              },
              tieumucconToHide.id_tieumuccon,
            );

            // Lấy các tiểu mục con còn hiển thị và nằm sau tiểu mục vừa xóa
            const remainingTieuMucCon = existingData2.cac_tieu_muc_con.filter(
              (tmc) => tmc.so_tieu_muc_con > sotieumuccon && tmc.hidden === 0,
            );

            // Nếu có tiểu mục con nằm dưới, cập nhật số của chúng
            if (remainingTieuMucCon.length > 0) {
              const updatePromises = remainingTieuMucCon.map((tmc) => {
                const parts = tmc.so_tieu_muc_con.split('.');
                parts[parts.length - 1] = (
                  parseInt(parts[parts.length - 1]) - 1
                ).toString();
                const newSoTieuMucCon = parts.join('.');

                return LuuTieuMucConCu(
                  { ...tmc, so_tieu_muc_con: newSoTieuMucCon },
                  tmc.id_tieumuccon,
                );
              });

              await Promise.all(updatePromises);
            } else {
              await LuuTieuMucConCu(
                {
                  ...tieumucconToHide,
                  hidden: 1,
                  so_tieu_muc_con: tieumucconToHide.id_tieumuccon,
                },
                tieumucconToHide.id_tieumuccon,
              );
            }

            // Cập nhật state
            setDataTieuChi((prevData) => {
              const newData = JSON.parse(JSON.stringify(prevData));
              const tieuChi = newData.find(
                (tc: any) => tc.so_tieuchi === level1Id,
              );
              if (tieuChi) {
                const tieuMuc = tieuChi.cac_tieu_muc.find(
                  (tm: any) => tm.so_tieu_muc === sotieumuc,
                );
                if (tieuMuc) {
                  // Ẩn tiểu mục con đã xóa
                  const indexToHide = tieuMuc.cac_tieu_muc_con.findIndex(
                    (tmc: any) => tmc.so_tieu_muc_con === sotieumuccon,
                  );
                  if (indexToHide !== -1) {
                    tieuMuc.cac_tieu_muc_con[indexToHide].hidden = 1;

                    // Cập nhật số cho các tiểu mục con còn lại
                    for (
                      let i = indexToHide + 1;
                      i < tieuMuc.cac_tieu_muc_con.length;
                      i++
                    ) {
                      if (tieuMuc.cac_tieu_muc_con[i].hidden === 0) {
                        const parts =
                          tieuMuc.cac_tieu_muc_con[i].so_tieu_muc_con.split(
                            '.',
                          );
                        parts[parts.length - 1] = (
                          parseInt(parts[parts.length - 1]) - 1
                        ).toString();
                        tieuMuc.cac_tieu_muc_con[i].so_tieu_muc_con =
                          parts.join('.');
                      }
                    }
                  }
                }
              }
              return newData;
            });

            setForceUpdate(Date.now());
            setStatus('DeleteTieuMucCon');
            messageApi.open({
              type: 'success',
              content: `Tiểu mục con ${sotieumuccon} đã được xóa`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error deleting tieu muc con:', error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi xóa tiểu mục con. Vui lòng thử lại.`,
      });
    } finally {
      setLoadingTieuMucConButtons((prev) => ({ ...prev, [key]: null }));
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

  return (
    <>
      {contextHolder}
      <div className="container">
        <h1 className="font-bold mb-4">Danh mục</h1>
        <div id="form-container">
          <div id="levels-container">
            {loadingDanhMuc === false ? (
              <>
                {[...Array(level1Count)].map((_, index) => {
                  const level1Id = index + 1;

                  const existingData = dataTieuChi.find(
                    (tc) => tc.so_tieuchi === level1Id && tc.hidden === 0,
                  );

                  const key = level1Id;
                  const isLoadingTieuChi = !!loadingTieuChiButtons[key];
                  const currentLoadingButtonTieuChi =
                    loadingTieuChiButtons[key];

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
                        />
                        <textarea
                          id={`noidung-tieuchi-cap1-${level1Id}`}
                          className=""
                          defaultValue={existingData?.mo_ta || ''}
                          rows={2}
                          style={{
                            width: '70%',
                            resize: 'none',
                            overflow: 'hidden',
                            verticalAlign: 'middle',
                            padding: '0 10px',
                            lineHeight: '2.8',
                            border: '1px solid #ced4da',
                            borderRadius: '0.25rem',
                          }}
                          placeholder="Nội dung Tiêu chí"
                        ></textarea>

                        <button
                          title="Lưu tiêu chí"
                          className={`justify-center rounded hover:bg-primary bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1 ${
                            isLoadingTieuChi
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => luuTieuChi(level1Id)}
                          disabled={isLoadingTieuChi}
                        >
                          {currentLoadingButtonTieuChi === 'luutieuchi' ? (
                            <LoadingOutlined />
                          ) : (
                            <SaveFilled />
                          )}
                        </button>

                        {existingData && (
                          <button
                            title="Thêm tiểu mục"
                            className={`justify-center rounded hover:bg-success bg-success p-3 font-medium text-gray hover:bg-opacity-90 ${
                              isLoadingTieuChi
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            onClick={() => themTieuMuc(level1Id)}
                            disabled={isLoadingTieuChi}
                          >
                            {currentLoadingButtonTieuChi === 'themtieumuc' ? (
                              <LoadingOutlined />
                            ) : (
                              <PlusCircleFilled />
                            )}
                          </button>
                        )}
                      </div>

                      {existingData?.cac_tieu_muc
                        .filter((item) => item.hidden === 0)
                        .map((item, level2Index) => {
                          const level2Id = level2Index + 1;

                          const existingDataTieuMuc =
                            existingData?.cac_tieu_muc.find(
                              (tc) =>
                                tc.so_tieu_muc === item?.so_tieu_muc &&
                                tc.hidden === 0,
                            );

                          const key = item?.so_tieu_muc;
                          const isLoadingTieuMuc = !!loadingTieuMucButtons[key];
                          const currentLoadingButtonTieuMuc =
                            loadingTieuMucButtons[key];

                          return (
                            <>
                              <div
                                key={`${item?.so_tieu_muc}-${forceUpdate}`}
                                className="level"
                                id={`level-2-${level1Id}-${level2Id}`}
                              >
                                <h3 className="text-primary font-bold">
                                  Tiểu mục - {item?.so_tieu_muc}
                                </h3>
                                <div>{item?.id_tieumuc}</div>
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
                                    defaultValue={item?.ten_tieu_muc || ''}
                                    id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
                                    style={{ width: '10%' }}
                                  />

                                  <textarea
                                    id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
                                    className=""
                                    defaultValue={item?.mo_ta_tieu_muc || ''}
                                    rows={2}
                                    style={{
                                      width: '70%',
                                      resize: 'none',
                                      overflow: 'hidden',
                                      verticalAlign: 'middle',
                                      padding: '0 10px',
                                      lineHeight: '2.8',
                                      border: '1px solid #ced4da',
                                      borderRadius: '0.25rem',
                                    }}
                                    placeholder="Nội dung Tiểu mục"
                                  ></textarea>
                                  <button
                                    title="Lưu tiểu mục"
                                    className={`justify-center hover:bg-primary rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1 ${
                                      isLoadingTieuMuc
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                    onClick={() =>
                                      luuTieuMuc(
                                        level1Id,
                                        level2Id,
                                        item?.so_tieu_muc,
                                      )
                                    }
                                    disabled={isLoadingTieuMuc}
                                  >
                                    {currentLoadingButtonTieuMuc ===
                                    'luutieumuc' ? (
                                      <LoadingOutlined />
                                    ) : (
                                      <SaveFilled />
                                    )}
                                  </button>
                                  {item?.cac_tieu_muc_con.filter(
                                    (item) => item.hidden === 0,
                                  ).length <= 0 ? (
                                    <Popconfirm
                                      title="Xóa tiểu mục"
                                      description="Bạn có chắc chắn muốn xóa tiểu mục này không?"
                                      icon={
                                        <QuestionCircleOutlined
                                          style={{ color: 'red' }}
                                        />
                                      }
                                      onConfirm={() =>
                                        xoaTieuMuc(
                                          level1Id,
                                          item?.so_tieu_muc,
                                          item?.id_tieumuc,
                                        )
                                      }
                                      okButtonProps={{
                                        className:
                                          'bg-blue-500 hover:bg-blue-600',
                                      }}
                                      okText="Xóa"
                                      cancelText="Không"
                                    >
                                      <button
                                        title="Xóa tiểu mục"
                                        className={`justify-center rounded bg-danger hover:bg-danger p-3 font-medium text-gray hover:bg-opacity-90 me-1 ${
                                          isLoadingTieuMuc
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                        }`}
                                        disabled={isLoadingTieuMuc}
                                      >
                                        {currentLoadingButtonTieuMuc ===
                                        'xoatieumuc' ? (
                                          <LoadingOutlined />
                                        ) : (
                                          <DeleteFilled />
                                        )}
                                      </button>
                                    </Popconfirm>
                                  ) : (
                                    <></>
                                  )}

                                  {item.ten_tieu_muc !== '' &&
                                    item.mo_ta_tieu_muc !== '' && (
                                      <button
                                        title="Thêm tiểu mục con"
                                        className={`justify-center rounded bg-success hover:bg-success p-3 font-medium text-gray hover:bg-opacity-90 ${
                                          isLoadingTieuMuc
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                        }`}
                                        id={`add-level3-${level1Id}-${level2Id}`}
                                        onClick={() =>
                                          themTieuMucCon(
                                            level1Id,
                                            item?.so_tieu_muc,
                                          )
                                        }
                                        disabled={isLoadingTieuMuc}
                                      >
                                        {currentLoadingButtonTieuMuc ===
                                        'themtieumuccon' ? (
                                          <LoadingOutlined />
                                        ) : (
                                          <PlusCircleFilled />
                                        )}
                                      </button>
                                    )}
                                </div>

                                {existingDataTieuMuc?.cac_tieu_muc_con
                                  .filter((item) => item.hidden === 0)
                                  .map((item, level3Index) => {
                                    const level3Id = level3Index + 1;
                                    const key = item?.so_tieu_muc_con;
                                    const isLoading =
                                      !!loadingTieuMucConButtons[key];
                                    const currentLoadingButton =
                                      loadingTieuMucConButtons[key];

                                    return (
                                      <div
                                        key={`${item?.so_tieu_muc_con}-${forceUpdate}`}
                                        data-so-tieu-muc-con={
                                          item?.so_tieu_muc_con
                                        }
                                        className="level"
                                        id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
                                      >
                                        <h3 className="text-success font-bold">
                                          Tiểu mục con - {item?.so_tieu_muc_con}
                                        </h3>

                                        <div
                                          className="input-group"
                                          key={item?.so_tieu_muc_con}
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
                                          />
                                          <input
                                            className="mr-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            type="number"
                                            min={1}
                                            placeholder="Mức"
                                            id={`muc-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                            style={{ width: '10%' }}
                                            defaultValue={
                                              item?.muc ? item?.muc : ''
                                            }
                                            onInput={(e: any) => {
                                              if (e.target.value <= 1)
                                                e.target.value = 1;
                                            }}
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
                                              resize: 'none',
                                              overflow: 'hidden',
                                              verticalAlign: 'middle',
                                              padding: '10px 10px',
                                              lineHeight: '1.5',
                                              border: '1px solid #ced4da',
                                              borderRadius: '0.25rem',
                                            }}
                                            placeholder="Nội dung Tiểu mục con"
                                          ></textarea>

                                          <button
                                            title="Lưu tiểu mục con"
                                            className={`justify-center rounded hover:bg-primary bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1 ${
                                              isLoading
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                            }`}
                                            onClick={() =>
                                              luuTieuMucCon(
                                                level1Id,
                                                level2Id,
                                                level3Id,
                                                existingDataTieuMuc?.so_tieu_muc,
                                                item?.so_tieu_muc_con,
                                              )
                                            }
                                            disabled={isLoading}
                                          >
                                            {currentLoadingButton ===
                                            'luutieumuccon' ? (
                                              <LoadingOutlined />
                                            ) : (
                                              <SaveFilled />
                                            )}
                                          </button>

                                          <Popconfirm
                                            title="Xóa tiểu mục con"
                                            description="Bạn có chắc chắn muốn xóa tiểu mục con này không?"
                                            icon={
                                              <QuestionCircleOutlined
                                                style={{ color: 'red' }}
                                              />
                                            }
                                            onConfirm={() =>
                                              xoaTieuMucCon(
                                                level1Id,
                                                level2Id,
                                                item?.so_tieu_muc_con,
                                                item?.id_tieumuccon,
                                              )
                                            }
                                            okButtonProps={{
                                              className:
                                                'bg-blue-500 hover:bg-blue-600',
                                            }}
                                            okText="Xóa"
                                            cancelText="Không"
                                          >
                                            <button
                                              title="Xóa tiểu mục con"
                                              className={`justify-center rounded hover:bg-danger bg-red-500 p-3 font-medium text-white hover:bg-opacity-90 me-1 ${
                                                isLoading
                                                  ? 'opacity-50 cursor-not-allowed'
                                                  : ''
                                              }`}
                                              disabled={isLoading}
                                            >
                                              {currentLoadingButton ===
                                              'xoatieumuccon' ? (
                                                <LoadingOutlined />
                                              ) : (
                                                <DeleteFilled />
                                              )}
                                            </button>
                                          </Popconfirm>

                                          {item.ten_tieu_muc_con !== '' &&
                                            item.mo_ta_tieu_muc_con !== '' &&
                                            item.muc !== '' && (
                                              <button
                                                title="Chèn thêm tiểu mục con"
                                                className={`justify-center rounded hover:bg-success bg-success p-3 font-medium text-gray hover:bg-opacity-90 ${
                                                  isLoading
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                                }`}
                                                id={`add-level3-${level1Id}-${level2Id}`}
                                                onClick={() =>
                                                  chenThemTieuMucCon(
                                                    level1Id,
                                                    level2Id,
                                                    item?.so_tieu_muc_con,
                                                  )
                                                }
                                                disabled={isLoading}
                                              >
                                                {currentLoadingButton ===
                                                'chenthemtieumuccon' ? (
                                                  <LoadingOutlined />
                                                ) : (
                                                  <PlusCircleFilled />
                                                )}
                                              </button>
                                            )}
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
                })}
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
      <div className="text-danger">Danh Mục Update Version 19/09/2024</div>
    </>
  );
};

export default ChiTieuCap1;
