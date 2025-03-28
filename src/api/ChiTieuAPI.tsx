import axios from 'axios';

export const DanhSachDanhMuc = async () => {
  try {
    let res = await fetch(`http://172.16.0.60:883/api/danh_muc`);
    return res.json();
  } catch (error) {
    console.log(error);
  }
};

export const CapNhatDanhGia = async (data: any) => {
  try {
    await axios.put(
      `http://172.16.0.60:83/api/cap_nhat_danhgia_tieu_muc`,
      data,
    );
  } catch (error) {
    console.log(error);
  }
};

export const ThemMoiDanhGia = async (data: any) => {
  try {
    await axios.post(`http://172.16.0.60:83/api/danh_gia_khoa`, data);
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuChiMoi = async (data: any) => {
  try {
    await fetch(`http://172.16.0.60:83/api/danh_muc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuChiCu = async (data: any, id_tieuchi: string) => {
  try {
    await fetch(`http://172.16.0.60:883/api/danh_muc/${sotieuchi}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

export const ThemTieuMuc = async (data: any, id_tieuchi: string | number) => {
  try {
    await fetch(`http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuMucCu = async (data: any, id_tieumuc: string) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuMucMoi = async (data: any, id_tieuchi: string) => {
  try {
    await fetch(`http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

export const ThemTieuMucCon = async (
  data: any,
  id_tieuchi: string | number,
  id_tieumuc: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuMucConCu = async (data: any, id_tieumuccon: string) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con/${sotieumuccon}`,

      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuMucConMoi = async (
  data: any,
  id_tieuchi: string | number,
  id_tieumuc: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const XoaTieuMuc = async (sotieuchi: number, sotieumuc: string) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const XoaTieuMucCon = async (
  sotieuchi: number,
  sotieumuc: string,
  sotieumuccon: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con/${sotieumuccon}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    console.log(error);
  }
};
