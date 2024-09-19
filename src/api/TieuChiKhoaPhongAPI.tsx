export const DanhSachKhoaPhong = async () => {
  try {
    let res = await fetch(`http://172.16.0.61/api_ds_khoa_phong`);
    return res.json();
  } catch (error) {
    console.log(error);
  }
};
