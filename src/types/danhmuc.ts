export type DanhMuc = {
  cac_tieu_muc: [
    {
      cac_tieu_muc_con: [
        {
          diem_toi_da: number | string;
          mo_ta_tieu_muc_con: string;
          muc: number | string;
          so_tieu_muc_con: string;
          ten_tieu_muc_con: string;
        },
      ];
      diem_toi_da: number;
      mo_ta_tieu_muc: string;
      so_tieu_muc: string;
      ten_tieu_muc: string;
    },
  ];
  mo_ta: string;
  nguoi_nhap: string;
  so_tieuchi: number;
  ten_tieuchi: string;
  thoi_gian_cap_nhat: string;
  thoi_gian_them_moi: string;
};
