import { Link } from 'react-router-dom';
import TableThree from '../../components/Tables/TableThree';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  useMaterialReactTable,
} from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import './ChiTieuCap1.css';
import { notification } from 'antd';

interface Level2Count {
  [key: number]: number;
}

interface Level3Count {
  [key: number]: { [key: number]: number };
}

interface TieuChi {
  so_tieuchi?: number;
  ten_tieuchi?: string;
  mo_ta?: string;
}

interface DanhMuc {
  cac_tieu_muc: [
    {
      cac_tieu_muc_con: [
        {
          diem_toi_da: number;
          mo_ta_tieu_muc_con: string;
          muc: number;
          so_tieu_muc_con: string;
          ten_tieu_muc_con: string;
        },
      ];
      diem_toi_da: number;
      mo_ta_tieu_muc: string;
      so_tieu_muc: number;
      ten_tieu_muc: string;
    },
  ];
  mo_ta: string;
  nguoi_nhap: string;
  so_tieuchi: number;
  ten_tieuchi: string;
  thoi_gian_cap_nhat: string;
  thoi_gian_them_moi: string;
}

interface TieuMuc {
  cac_tieu_muc_con: [
    {
      diem_toi_da: number;
      mo_ta_tieu_muc_con: string;
      muc: number;
      so_tieu_muc_con: string;
      ten_tieu_muc_con: string;
    },
  ];
  diem_toi_da: number;
  mo_ta_tieu_muc: string;
  so_tieu_muc: number;
  ten_tieu_muc: string;
}

const ChiTieuCap1: React.FC = () => {
  const [dataTieuChi, setDataTieuChi] = useState<DanhMuc[]>([]);

  const [level1Count] = useState<number>(83);
  const [level2Counts, setLevel2Counts] = useState<Level2Count>({});
  const [level3Counts, setLevel3Counts] = useState<Level3Count>({});
  const [status, setStatus] = useState<string>('');

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const fetchDataTieuChi = async () => {
      try {
        let res = await fetch('http://172.16.0.60:83/api/danh_muc', {
          cache: 'no-store',
        });
        if (res && res.ok) {
          let data = await res.json();

          setDataTieuChi(data?.danh_muc);
          setStatus('Fetch');
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataTieuChi();
  }, [status]);

  useEffect(() => {
    initLevel1();
  }, []);

  const initLevel1 = () => {
    const newLevel2Counts: Level2Count = {};
    for (let i = 1; i <= level1Count; i++) {
      newLevel2Counts[i] = 0;
    }
    setLevel2Counts(newLevel2Counts);
  };

  const saveLevel1 = async (level1Id: number) => {
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

    if (tenTieuchi && noidungTieuchi) {
      const tieuchiDataPost = {
        so_tieuchi: level1Id,
        ten_tieuchi: tenTieuchi,
        mo_ta: noidungTieuchi,
        cac_tieu_muc: [],
      };

      const tieuchiDataPut = {
        so_tieuchi: level1Id,
        ten_tieuchi: tenTieuchi,
        mo_ta: noidungTieuchi,
      };

      try {
        let res;
        let existingData = dataTieuChi.find((tc) => tc.so_tieuchi === level1Id);
        if (existingData) {
          // Update existing tieu chi
          res = await fetch(`http://172.16.0.60:83/api/danh_muc/${level1Id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tieuchiDataPut),
          });
          setStatus('TieuChi');
        } else {
          // Create new tieu chi
          res = await fetch(`http://172.16.0.60:83/api/danh_muc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tieuchiDataPost),
          });
          setStatus('TieuChi');
        }

        const addLevel2Button = document.getElementById(
          `add-level2-${level1Id}`,
        );
        if (addLevel2Button) addLevel2Button.classList.remove('hidden');

        if (res && res.ok) {
          const updatedData = await res.json();
          setDataTieuChi((prevData) => {
            const newData = [...prevData];
            const index = newData.findIndex((tc) => tc.so_tieuchi === level1Id);
            if (index !== -1) {
              newData[index] = updatedData;
            } else {
              newData.push(updatedData);
            }
            return newData;
          });

          api['success']({
            message: 'Thành công',
            description: `Cấp 1 số ${level1Id} đã được lưu.`,
          });
        } else {
          // throw new Error('Failed to save');
          api['error']({
            message: 'Thất bại',
            description: 'Lỗi khi lưu',
          });
        }
      } catch (error) {
        console.error('Error saving tieu chi:', error);

        api['error']({
          message: 'Thất bại',
          description: 'Đã có lỗi xảy ra khi lưu tiêu chí. Vui lòng thử lại.',
        });
      }
    } else {
      api['error']({
        message: 'Thất bại',
        description: 'Vui lòng nhập đầy đủ thông tin cấp 1.',
      });
    }
  };

  const addLevel2 = (level1Id: number) => {
    setLevel2Counts((prevCounts) => ({
      ...prevCounts,
      [level1Id]: (prevCounts[level1Id] || 0) + 1,
    }));

    setLevel3Counts((prevCounts) => ({
      ...prevCounts,
      [level1Id]: {
        ...prevCounts[level1Id],
        [level2Counts[level1Id] + 1]: 0,
      },
    }));
  };

  const saveLevel2 = async (level1Id: number, level2Id: number) => {
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

    const tieumucDataPost = {
      so_tieu_muc: Number(`${level1Id}.${level2Id}`),
      ten_tieu_muc: tenTieumuc,
      mo_ta_tieu_muc: noidungTieumuc,
      diem_toi_da: 1,
      cac_tieu_muc_con: [],
    };

    const tieumucDataPut = {
      ten_tieu_muc: tenTieumuc,
      mo_ta_tieu_muc: noidungTieumuc,
      diem_toi_da: 1,
      cac_tieu_muc_con: [],
    };

    if (tenTieumuc && noidungTieumuc) {
      try {
        let res;

        let existingData1 = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        let existingData2 = existingData1?.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === Number(`${level1Id}.${level2Id}`),
        );
        if (existingData2) {
          // Update existing tieu chi
          res = await fetch(
            `http://172.16.0.60:83/api/danh_muc/${level1Id}/tieu_muc/${Number(
              `${level1Id}.${level2Id}`,
            )}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tieumucDataPut),
            },
          );
          setStatus('TieuMuc');
        } else {
          // Create new tieu chi
          res = await fetch(
            `http://172.16.0.60:83/api/danh_muc/${level1Id}/tieu_muc`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tieumucDataPost),
            },
          );
          setStatus('TieuMuc');
        }

        const addLevel2Button = document.getElementById(
          `add-level2-${level1Id}`,
        );
        if (addLevel2Button) addLevel2Button.classList.remove('hidden');

        if (res && res.ok) {
          api['success']({
            message: 'Thành công',
            description: `Cấp 2 số ${level2Id} đã được lưu.`,
          });
        } else {
          // throw new Error('Failed to save');
          api['error']({
            message: 'Thất bại',
            description: 'Lỗi khi lưu',
          });
        }
      } catch (error) {
        console.error('Error saving tieu chi:', error);

        api['error']({
          message: 'Thất bại',
          description: 'Đã có lỗi xảy ra khi lưu tiểu mục. Vui lòng thử lại.',
        });
      }
    } else {
      api['error']({
        message: 'Thất bại',
        description: 'Vui lòng nhập đầy đủ thông tin cấp 2.',
      });
    }
  };

  const addLevel3 = (level1Id: number, level2Id: number) => {
    setLevel3Counts((prevCounts) => ({
      ...prevCounts,
      [level1Id]: {
        ...prevCounts[level1Id],
        [level2Id]: (prevCounts[level1Id]?.[level2Id] || 0) + 1,
      },
    }));
  };

  const saveLevel3 = async (
    level1Id: number,
    level2Id: number,
    level3Id: number,
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

    if (tenTieumuccon && noidungTieumuccon) {
      const tieumucconDataPost = {
        so_tieu_muc_con: `${level1Id}.${level2Id}.${level3Id}`,
        ten_tieu_muc_con: tenTieumuccon,
        mo_ta_tieu_muc_con: noidungTieumuccon,
        diem_toi_da: 1,
      };

      const tieumucconDataPut = {
        ten_tieu_muc_con: tenTieumuccon,
        mo_ta_tieu_muc_con: noidungTieumuccon,
        diem_toi_da: 1,
      };

      try {
        let res;

        let existingData1 = dataTieuChi.find(
          (tc) => tc.so_tieuchi === level1Id,
        );

        let existingData2 = existingData1?.cac_tieu_muc.find(
          (tc) => tc.so_tieu_muc === Number(`${level1Id}.${level2Id}`),
        );

        let existingData3 = existingData2?.cac_tieu_muc_con.find(
          (tc) => tc.so_tieu_muc_con === `${level1Id}.${level2Id}.${level3Id}`,
        );

        if (existingData3) {
          // Update existing tieu chi
          res = await fetch(
            `http://172.16.0.60:83/api/danh_muc/${level1Id}/tieu_muc/${Number(
              `${level1Id}.${level2Id}`,
            )}/tieu_muc_con/${level1Id}.${level2Id}.${level3Id}`,

            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tieumucconDataPut),
            },
          );
          setStatus('TieuMucCon');
        } else {
          // Create new tieu chi
          res = await fetch(
            `http://172.16.0.60:83/api/danh_muc/${level1Id}/tieu_muc/${Number(
              `${level1Id}.${level2Id}`,
            )}/tieu_muc_con`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tieumucconDataPost),
            },
          );
          setStatus('TieuMucCon');
        }

        const addLevel2Button = document.getElementById(
          `add-level2-${level1Id}`,
        );
        if (addLevel2Button) addLevel2Button.classList.remove('hidden');

        if (res && res.ok) {
          api['success']({
            message: 'Thành công',
            description: `Cấp 3 số ${level1Id}.${level2Id}.${level3Id} đã được lưu.`,
          });
        } else {
          // throw new Error('Failed to save');
          api['error']({
            message: 'Thất bại',
            description:
              'Đã có lỗi xảy ra khi lưu tiểu mục con. Vui lòng thử lại.',
          });
        }
      } catch (error) {
        console.error('Error saving tieu chi:', error);

        api['error']({
          message: 'Thất bại',
          description:
            'Đã có lỗi xảy ra khi lưu tiểu mục con. Vui lòng thử lại.',
        });
      }
    } else {
      api['error']({
        message: 'Thất bại',
        description: 'Vui lòng nhập đầy đủ thông tin cấp 3.',
      });
    }
  };
  return (
    // <TableThree/>

    <>
      {contextHolder}
      <div className="container">
        <h2>Danh mục</h2>
        <div id="form-container">
          <div id="levels-container">
            {[...Array(level1Count)].map((_, index) => {
              const level1Id = index + 1;
              // const existingData = detailedTieuChi[level1Id];
              const existingData = dataTieuChi.find(
                (tc) => tc.so_tieuchi === level1Id,
              );
              return (
                <div
                  key={`level-1-${level1Id}`}
                  className="level"
                  id={`level-1-${level1Id}`}
                >
                  <h3>Tiêu chí - {level1Id}</h3>
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
                    <input
                      type="text"
                      placeholder="Nội dung Tiêu chí"
                      id={`noidung-tieuchi-cap1-${level1Id}`}
                      defaultValue={existingData?.mo_ta || ''}
                      style={{ width: '70%' }}
                    />
                    <button
                      className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                      onClick={() => saveLevel1(level1Id)}
                    >
                      Lưu cấp 1
                    </button>

                    {existingData && (
                      <button
                        className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        onClick={() => addLevel2(level1Id)}
                      >
                        Thêm cấp 2
                      </button>
                    )}
                  </div>

                  {[...Array(level2Counts[level1Id] || 0)].map(
                    (_, level2Index) => {
                      const level2Id = level2Index + 1;
                      const existingDataTieuMuc =
                        existingData?.cac_tieu_muc.find(
                          (tc) =>
                            tc.so_tieu_muc ===
                            Number(`${level1Id}.${level2Id}`),
                        );

                      return (
                        <>
                          <div
                            key={`level-2-${level1Id}-${level2Id}`}
                            className="level"
                            id={`level-2-${level1Id}-${level2Id}`}
                          >
                            <h3>
                              Tiểu mục - {level1Id}.{level2Id}
                            </h3>
                            <div className="input-group">
                              <input
                                type="text"
                                placeholder="Số"
                                value={`${level1Id}.${level2Id}`}
                                readOnly
                                style={{ width: '5%' }}
                              />
                              <input
                                type="text"
                                placeholder="Tên Tiểu mục"
                                defaultValue={
                                  existingDataTieuMuc?.ten_tieu_muc || ''
                                }
                                id={`ten-tieumuc-cap2-${level1Id}-${level2Id}`}
                                style={{ width: '10%' }}
                              />
                              <input
                                type="text"
                                placeholder="Nội dung Tiểu mục"
                                defaultValue={
                                  existingDataTieuMuc?.mo_ta_tieu_muc || ''
                                }
                                id={`noidung-tieumuc-cap2-${level1Id}-${level2Id}`}
                                style={{ width: '70%' }}
                              />
                              <button
                                className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                onClick={() => saveLevel2(level1Id, level2Id)}
                              >
                                Lưu cấp 2
                              </button>
                              {existingDataTieuMuc && (
                                <button
                                  className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  id={`add-level3-${level1Id}-${level2Id}`}
                                  onClick={() => addLevel3(level1Id, level2Id)}
                                >
                                  Thêm cấp 3
                                </button>
                              )}
                            </div>
                            {[
                              ...Array(level3Counts[level1Id]?.[level2Id] || 0),
                            ].map((_, level3Index) => {
                              const level3Id = level3Index + 1;
                              const existingDataTieuMucCon =
                                existingDataTieuMuc?.cac_tieu_muc_con.find(
                                  (tc) =>
                                    tc.so_tieu_muc_con ===
                                    `${level1Id}.${level2Id}.${level3Id}`,
                                );
                              return (
                                <div
                                  key={`level-3-${level1Id}-${level2Id}-${level3Id}`}
                                  className="level"
                                  id={`level-3-${level1Id}-${level2Id}-${level3Id}`}
                                >
                                  <h3>
                                    Tiểu mục con - {level1Id}.{level2Id}.
                                    {level3Id}
                                  </h3>
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      placeholder="Số"
                                      value={`${level1Id}.${level2Id}.${level3Id}`}
                                      readOnly
                                      style={{ width: '5%' }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Tên Tiểu mục con"
                                      id={`ten-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                      style={{ width: '10%' }}
                                      defaultValue={
                                        existingDataTieuMucCon?.ten_tieu_muc_con ||
                                        ''
                                      }
                                    />
                                    <input
                                      type="text"
                                      placeholder="Nội dung Tiểu mục con"
                                      id={`noidung-tieumuccon-cap3-${level1Id}-${level2Id}-${level3Id}`}
                                      style={{ width: '70%' }}
                                      defaultValue={
                                        existingDataTieuMucCon?.mo_ta_tieu_muc_con ||
                                        ''
                                      }
                                    />
                                    <button
                                      className="justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                      onClick={() =>
                                        saveLevel3(level1Id, level2Id, level3Id)
                                      }
                                    >
                                      Lưu cấp 3
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    },
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChiTieuCap1;
