import { createContext } from 'react';

export const UserContext = createContext<{
  tenNhanVien: string;
  khoaPhong: string;
}>({
  tenNhanVien: '',
  khoaPhong: '',
});
