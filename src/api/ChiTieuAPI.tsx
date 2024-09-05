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

export const LuuTieuChiCu = async (data: any, sotieuchi: number) => {
  try {
    await fetch(`http://172.16.0.60:83/api/danh_muc/${sotieuchi}`, {
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

export const ThemTieuMuc = async (data: any, sotieuchi: number) => {
  try {
    await fetch(`http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc`, {
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

export const LuuTieuMucCu = async (
  data: any,
  sotieuchi: number,
  sotieumuc: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}`,
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

export const LuuTieuMucMoi = async (data: any, sotieuchi: number) => {
  try {
    await fetch(`http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc`, {
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
  sotieuchi: number,
  sotieumuc: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con`,
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

export const LuuTieuMucConCu = async (
  data: any,
  sotieuchi: number,
  sotieumuc: string,
  sotieumuccon: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con/${sotieumuccon}`,

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
  sotieuchi: number,
  sotieumuc: string,
) => {
  try {
    await fetch(
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con`,
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
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}`,
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
      `http://172.16.0.60:83/api/danh_muc/${sotieuchi}/tieu_muc/${sotieumuc}/tieu_muc_con/${sotieumuccon}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    console.log(error);
  }
};
