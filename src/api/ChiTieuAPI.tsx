export const DanhSachDanhMuc = async () => {
  try {
    let res = await fetch(`http://172.16.0.60:883/api/danh_muc`);
    return res.json();
  } catch (error) {
    console.log(error);
  }
};

export const LuuTieuChiMoi = async (data: any) => {
  try {
    await fetch(`http://172.16.0.60:883/api/danh_muc`, {
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
    await fetch(
      `http://172.16.0.60:883/api/danh_muc/update_by_id/${id_tieuchi}`,
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

export const ThemTieuMuc = async (data: any, id_tieuchi: string | number) => {
  try {
    await fetch(`http://172.16.0.60:883/api/danh_muc/${id_tieuchi}/tieu_muc`, {
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
      `http://172.16.0.60:883/api/danh_muc/update_by_id/${id_tieumuc}`,
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
    await fetch(`http://172.16.0.60:883/api/danh_muc/${id_tieuchi}/tieu_muc`, {
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
      `http://172.16.0.60:883/api/danh_muc/${id_tieuchi}/tieu_muc/${id_tieumuc}/tieu_muc_con`,
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
      `http://172.16.0.60:883/api/danh_muc/update_by_id/${id_tieumuccon}`,

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
      `http://172.16.0.60:883/api/danh_muc/${id_tieuchi}/tieu_muc/${id_tieumuc}/tieu_muc_con`,
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
