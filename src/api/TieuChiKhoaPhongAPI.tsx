import axios from 'axios';

export const DangNhap = async (tennhanvien: string, matkhau: string) => {
  try {
    let res = await axios.post('http://172.16.0.53:8080/api/auth/login', {
      username: tennhanvien,
      password: matkhau,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const DanhSachKhoaPhong = async () => {
  try {
    let res = await fetch(`http://172.16.0.61/api_ds_khoa_phong`);
    return res.json();
  } catch (error) {
    console.log(error);
  }
};

export const DanhSachNhanVienToanVien = async () => {
  try {
    let res = await axios.get(
      `http://172.16.0.53:8080/danh_sach_nhanvien_toanvien`,
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const PhanQuyenTieuChi = async (data: any) => {
  try {
    await fetch(`http://172.16.0.60:83/api/phan_quyen`, {
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

export const DanhSachPhanQuyenTieuChi = async () => {
  try {
    let res = await axios.get(`http://172.16.0.60:83/api/phan_quyen`);

    return res.data;
  } catch (error) {
    console.log(error);
  }
};
