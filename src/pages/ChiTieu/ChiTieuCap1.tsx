import { useEffect, useState } from 'react';
import './ChiTieuCap1.css';
import { message, Popconfirm } from 'antd';
import {
  DeleteFilled,
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
  ThemTieuMuc,
  ThemTieuMucCon,
  XoaTieuMuc,
  XoaTieuMucCon,
} from '../../api/ChiTieuAPI';
import { TieuMuc } from '../../types/tieumuc';

import { ScaleLoader } from 'react-spinners';

interface Level2Count {
  [key: number]: number;
}

interface Level3Count {
  [key: number]: { [key: number]: number };
}

const ChiTieuCap1: React.FC = () => {
  const [dataTieuChi, setDataTieuChi] = useState<DanhMuc[]>([]);

  const [level1Count] = useState<number>(83);

  const [status, setStatus] = useState<string>('');

  const [forceUpdate, setForceUpdate] = useState(0);

  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);

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
          // setDataTieuChi(data?.danh_muc);
          setDataTieuChi(sortedData);
          initializeLevelCounts(data?.danh_muc);
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

  const initializeLevelCounts = (data: DanhMuc[]) => {
    const newLevel2Counts: Level2Count = {};
    const newLevel3Counts: Level3Count = {};

    data.forEach((item) => {
      const level1Id = item.so_tieuchi;
      newLevel2Counts[level1Id] = item.cac_tieu_muc.length;

      item.cac_tieu_muc.forEach((tieuMuc, index) => {
        const level2Id = index + 1;
        if (!newLevel3Counts[level1Id]) {
          newLevel3Counts[level1Id] = {};
        }
        newLevel3Counts[level1Id][level2Id] = tieuMuc.cac_tieu_muc_con.length;
      });
    });
  };

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

      try {
        let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
        if (existingData) {
          await LuuTieuChiCu(tieuchiDataPut, level1Id);

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

  const findNextAvailableSoTieuMuc = (existingData: any[]): string => {
    let maxSoTieuMuc = '0';
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
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        if (existingData.cac_tieu_muc.length <= 0) {
          const tieumucDataPost = {
            so_tieu_muc: `${existingData?.so_tieuchi}.${1}`,
            ten_tieu_muc: '',
            mo_ta_tieu_muc: '',
            diem_toi_da: '',
            cac_tieu_muc_con: [],
            hidden: 0,
          };

          await ThemTieuMuc(tieumucDataPost, existingData?.so_tieuchi);
          setStatus('ThemTieuMuc');
        } else {
          const newSoTieuMuc = findNextAvailableSoTieuMuc(
            existingData.cac_tieu_muc,
          );

          const tieumucDataPostExisting = {
            so_tieu_muc: newSoTieuMuc,
            ten_tieu_muc: '',
            mo_ta_tieu_muc: '',
            diem_toi_da: '',
            cac_tieu_muc_con: [],
            hidden: 0,
          };

          await ThemTieuMuc(tieumucDataPostExisting, existingData?.so_tieuchi);
          setStatus('ThemTieuMuc');
        }
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: `Đã có lỗi xảy ra khi thêm tiểu mục. Vui lòng thử lại.`,
      });
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

    const tieumucDataPost = {
      so_tieu_muc: sotieumuc,
      ten_tieu_muc: tenTieumuc,
      mo_ta_tieu_muc: noidungTieumuc,
      diem_toi_da: '',
      cac_tieu_muc_con: [],
      hidden: 0,
    };

    const tieumucDataPut = {
      ten_tieu_muc: tenTieumuc,
      mo_ta_tieu_muc: noidungTieumuc,
      diem_toi_da: '',
      hidden: 0,
    };

    if (tenTieumuc?.trim() !== '' && noidungTieumuc?.trim() !== '') {
      try {
        let existingData1 = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        let existingData2 = existingData1?.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === sotieumuc,
        );
        if (existingData2) {
          await LuuTieuMucCu(tieumucDataPut, level1Id, sotieumuc);
          setStatus('TieuMuc');
        } else {
          await LuuTieuMucMoi(tieumucDataPost, level1Id);
          setStatus('TieuMuc');
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
      }
    } else {
      messageApi.open({
        type: 'error',
        content: `Vui lòng nhập đầy đủ thông tin tiểu mục.`,
      });
    }
  };

  const themTieuMucCon = async (level1Id: number, level2Id: number) => {
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        let existingData2 = existingData.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === `${existingData?.so_tieuchi}.${level2Id}`,
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
              existingData?.so_tieuchi,
              existingData2?.so_tieu_muc,
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
              existingData?.so_tieuchi,
              existingData2?.so_tieu_muc,
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
    }
  };

  const chenThemTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    currentSoTieuMucCon: string,
  ) => {
    try {
      let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
      if (existingData) {
        let existingData2: any = existingData.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === `${existingData?.so_tieuchi}.${level2Id}`,
        );

        if (existingData2) {
          // Tính toán số tiểu mục con mới
          const parts = currentSoTieuMucCon.split('.');
          const newLastPart = parseInt(parts[parts.length - 1]) + 1;
          const newSoTieuMucCon = [...parts.slice(0, -1), newLastPart].join(
            '.',
          );

          // Chuẩn bị tiểu mục con mới
          const newTieuMucCon = {
            so_tieu_muc_con: newSoTieuMucCon,
            ten_tieu_muc_con: '',
            mo_ta_tieu_muc_con: '',
            diem_toi_da: '',
            muc: '',
            hidden: 0,
          };

          // Tìm vị trí chèn
          const insertIndex =
            existingData2.cac_tieu_muc_con.findIndex(
              (tmc: any) => tmc.so_tieu_muc_con === currentSoTieuMucCon,
            ) + 1;

          // Tạo mảng mới với tiểu mục con mới được chèn vào
          let updatedTieuMucCon = [
            ...existingData2.cac_tieu_muc_con.slice(0, insertIndex),
            newTieuMucCon,
            ...existingData2.cac_tieu_muc_con.slice(insertIndex),
          ];

          // Cập nhật so_tieu_muc_con cho các mục sau
          const updatePromises = [];
          for (let i = insertIndex + 1; i < updatedTieuMucCon.length; i++) {
            const tmcParts = updatedTieuMucCon[i].so_tieu_muc_con.split('.');
            tmcParts[tmcParts.length - 1] = (
              parseInt(tmcParts[tmcParts.length - 1]) + 1
            ).toString();
            const updatedSoTieuMucCon = tmcParts.join('.');

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
              ...updatedTieuMucCon[i],
              so_tieu_muc_con: updatedSoTieuMucCon,
            };

            // Tạo promise cập nhật
            const updatePromise = await LuuTieuMucConCu(
              updateData,
              existingData.so_tieuchi,
              existingData2.so_tieu_muc,

              updatedTieuMucCon[i].so_tieu_muc_con,
            );

            updatePromises.push(updatePromise);

            // Cập nhật dữ liệu cục bộ
            updatedTieuMucCon[i].so_tieu_muc_con = updatedSoTieuMucCon;
            // updatedTieuMucCon[i] = {
            //   ...updatedTieuMucCon[i],
            //   so_tieu_muc_con: updatedSoTieuMucCon,
            // };
          }

          // Thêm tiểu mục con mới
          const addNewPromise = await LuuTieuMucConMoi(
            newTieuMucCon,
            existingData.so_tieuchi,
            existingData2.so_tieu_muc,
          );

          updatePromises.push(addNewPromise);

          // Cập nhật state cục bộ
          const updatedDataTieuChi = [...dataTieuChi];
          // const updatedDataTieuChi = JSON.parse(JSON.stringify(dataTieuChi));
          const updatedTieuChiIndex = updatedDataTieuChi.findIndex(
            (tc: any) => tc.so_tieuchi === level1Id,
          );
          const updatedTieuMucIndex = updatedDataTieuChi[
            updatedTieuChiIndex
          ].cac_tieu_muc.findIndex(
            (tm: any) =>
              tm.so_tieu_muc === `${existingData?.so_tieuchi}.${level2Id}`,
          );
          updatedDataTieuChi[updatedTieuChiIndex].cac_tieu_muc[
            updatedTieuMucIndex
          ].cac_tieu_muc_con = updatedTieuMucCon as [typeof newTieuMucCon];

          setDataTieuChi(updatedDataTieuChi);
          setForceUpdate(Date.now()); // Thêm state forceUpdate nếu chưa có
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
    }
  };

  const luuTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    level3Id: number,
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
    const diemTieumuccon = (
      document.getElementById(
        `diem-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`,
      ) as HTMLInputElement
    )?.value;
    if (
      tenTieumuccon?.trim() !== '' &&
      noidungTieumuccon?.trim() !== '' &&
      mucTieumuccon?.trim() !== ''
    ) {
      const tieumucconDataPost = {
        so_tieu_muc_con: `${sotieumuccon}`,
        ten_tieu_muc_con: tenTieumuccon,
        mo_ta_tieu_muc_con: noidungTieumuccon,
        muc: mucTieumuccon,
        diem_toi_da: '',
        hidden: 0,
      };

      const tieumucconDataPut = {
        ten_tieu_muc_con: tenTieumuccon,
        mo_ta_tieu_muc_con: noidungTieumuccon,
        muc: mucTieumuccon,
        diem_toi_da: '',
        hidden: 0,
      };

      try {
        let existingData1: DanhMuc | undefined = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        if (!existingData1) {
          throw new Error('Không tìm thấy tiêu chí');
        }

        let existingData2: TieuMuc | undefined =
          existingData1.cac_tieu_muc.find(
            (tc) => tc.so_tieu_muc === `${level1Id}.${level2Id}`,
          );

        if (!existingData2) {
          throw new Error('Không tìm thấy tiêu mục');
        }

        let existingData3 = existingData2.cac_tieu_muc_con.find(
          (tc) => tc.so_tieu_muc_con === `${sotieumuccon}`,
        );

        if (existingData3) {
          await LuuTieuMucConCu(
            tieumucconDataPut,
            existingData1.so_tieuchi,
            existingData2.so_tieu_muc,
            existingData3.so_tieu_muc_con,
          );
          setStatus('TieuMucCon');
        } else {
          await LuuTieuMucConMoi(
            tieumucconDataPost,
            existingData1.so_tieuchi,
            existingData2.so_tieu_muc,
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
      }
    } else {
      messageApi.open({
        type: 'error',
        content: `Vui lòng nhập đầy đủ thông tin tiểu mục con.`,
      });
    }
  };
  const xoaTieuMuc = async (level1Id: number, sotieumuc: string) => {
    // try {
    //   await XoaTieuMuc(level1Id, sotieumuc);
    //   setStatus('DeleteTieuMuc');
    //   messageApi.open({
    //     type: 'success',
    //     content: `Tiểu mục ${sotieumuc} đã được xóa.`,
    //   });
    // } catch (error) {
    //   console.error('Error deleting tieu muc:', error);
    //   messageApi.open({
    //     type: 'error',
    //     content: `Đã có lỗi xảy ra khi xóa tiểu mục. Vui lòng thử lại.`,
    //   });
    // }
  };

  const xoaTieuMucCon = async (
    level1Id: number,
    level2Id: number,
    sotieumuccon: string,
  ) => {
    // try {
    //   let sotieumuc = `${level1Id}.${level2Id}`;
    //   await XoaTieuMucCon(level1Id, sotieumuc, sotieumuccon);
    // // Lấy danh sách tiểu mục con hiện tại từ state
    // const currentTieuChi = dataTieuChi.find(
    //   (tc) => tc.so_tieuchi === level1Id,
    // );
    // const currentTieuMuc = currentTieuChi?.cac_tieu_muc.find(
    //   (tm) => tm.so_tieu_muc === sotieumuc,
    // );
    // const currentTieuMucCon =
    //   currentTieuMuc?.cac_tieu_muc_con.filter(
    //     (tmc) => tmc.so_tieu_muc_con !== sotieumuccon,
    //   ) || [];
    // // Cập nhật số thứ tự cho các tiểu mục con còn lại
    // for (let i = 0; i < currentTieuMucCon.length; i++) {
    //   const tmc = currentTieuMucCon[i];
    //   const parts = tmc.so_tieu_muc_con.split('.');
    //   parts[parts.length - 1] = (i + 1).toString();
    //   const newSoTieuMucCon = parts.join('.');
    //   if (tmc.so_tieu_muc_con !== newSoTieuMucCon) {
    //     const updateResponse = await fetch(
    //       `http://172.16.0.60:883/api/danh_muc/${level1Id}/tieu_muc/${sotieumuc}/tieu_muc_con/${tmc.so_tieu_muc_con}`,
    //       {
    //         method: 'PUT',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ so_tieu_muc_con: newSoTieuMucCon }),
    //       },
    //     );
    //     if (!updateResponse.ok) {
    //       throw new Error('Không thể cập nhật số thứ tự tiểu mục con');
    //     }
    //   }
    // }
    // // Cập nhật state local
    // setDataTieuChi((prevData) => {
    //   const newData = JSON.parse(JSON.stringify(prevData));
    //   const tieuChi = newData.find((tc: any) => tc.so_tieuchi === level1Id);
    //   if (tieuChi) {
    //     const tieuMuc = tieuChi.cac_tieu_muc.find(
    //       (tm: any) => tm.so_tieu_muc === sotieumuc,
    //     );
    //     if (tieuMuc) {
    //       tieuMuc.cac_tieu_muc_con = currentTieuMucCon;
    //     }
    //   }
    //   return newData;
    // });
    // // Kích hoạt re-render
    // setForceUpdate(Date.now());
    //   setStatus('DeleteTieuMucCon');
    //   messageApi.open({
    //     type: 'success',
    //     content: `Tiểu mục con ${sotieumuccon} đã được xóa.`,
    //   });
    // } catch (error) {
    //   console.error('Error deleting tieu muc con:', error);
    //   messageApi.open({
    //     type: 'error',
    //     content: `Đã có lỗi xảy ra khi xóa tiểu mục con. Vui lòng thử lại.`,
    //   });
    // }
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
                    (tc) => tc.so_tieuchi === level1Id,
                  );
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
                          style={{ width: '5%' }}
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
                          className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1"
                          onClick={() => luuTieuChi(level1Id)}
                        >
                          <SaveFilled />
                        </button>

                        {existingData && (
                          <button
                            title="Thêm tiểu mục"
                            className="justify-center rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90"
                            onClick={() => themTieuMuc(level1Id)}
                          >
                            <PlusCircleFilled />
                          </button>
                        )}
                      </div>

                      {existingData?.cac_tieu_muc.map((item, level2Index) => {
                        const level2Id = level2Index + 1;

                        const existingDataTieuMuc =
                          existingData?.cac_tieu_muc.find(
                            (tc) =>
                              tc.so_tieu_muc === `${level1Id}.${level2Id}`,
                          );

                        return (
                          <>
                            <div
                              key={item?.so_tieu_muc}
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
                                  style={{ width: '5%' }}
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
                                  className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1"
                                  onClick={() =>
                                    luuTieuMuc(
                                      level1Id,
                                      level2Id,
                                      item?.so_tieu_muc,
                                    )
                                  }
                                >
                                  <SaveFilled />
                                </button>
                                {/* {item?.cac_tieu_muc_con.length < 0 ? (
                                  <Popconfirm
                                    title="Xóa tiểu mục"
                                    description="Bạn có chắc chắn muốn xóa tiểu mục này không?"
                                    icon={
                                      <QuestionCircleOutlined
                                        style={{ color: 'red' }}
                                      />
                                    }
                                    onConfirm={() =>
                                      xoaTieuMuc(level1Id, item?.so_tieu_muc)
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
                                      className="justify-center rounded bg-red-500 p-3 font-medium text-white hover:bg-opacity-90 me-1"
                                    >
                                      <DeleteFilled />
                                    </button>
                                  </Popconfirm>
                                ) : (
                                  <></>
                                )} */}

                                {item.ten_tieu_muc !== '' &&
                                  item.mo_ta_tieu_muc !== '' && (
                                    <button
                                      title="Thêm tiểu mục con"
                                      className="justify-center rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90"
                                      id={`add-level3-${level1Id}-${level2Id}`}
                                      onClick={() =>
                                        themTieuMucCon(level1Id, level2Id)
                                      }
                                    >
                                      <PlusCircleFilled />
                                    </button>
                                  )}
                              </div>

                              {existingDataTieuMuc?.cac_tieu_muc_con.map(
                                (item, level3Index) => {
                                  const level3Id = level3Index + 1;

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
                                          style={{ width: '5%' }}
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
                                          className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 me-1 ml-1"
                                          onClick={() =>
                                            luuTieuMucCon(
                                              level1Id,
                                              level2Id,
                                              level3Id,
                                              item?.so_tieu_muc_con,
                                            )
                                          }
                                        >
                                          <SaveFilled />
                                        </button>

                                        {/* <Popconfirm
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
                                            className="justify-center rounded bg-red-500 p-3 font-medium text-white hover:bg-opacity-90 me-1"
                                          >
                                            <DeleteFilled />
                                          </button>
                                        </Popconfirm> */}

                                        {item.ten_tieu_muc_con !== '' &&
                                          item.mo_ta_tieu_muc_con !== '' &&
                                          item.muc !== '' && (
                                            <button
                                              title="Thêm tiểu mục con"
                                              className="justify-center rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90"
                                              id={`add-level3-${level1Id}-${level2Id}`}
                                              onClick={() =>
                                                chenThemTieuMucCon(
                                                  level1Id,
                                                  level2Id,
                                                  item?.so_tieu_muc_con,
                                                )
                                              }
                                            >
                                              <PlusCircleFilled />
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
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
                  <ScaleLoader />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChiTieuCap1;
