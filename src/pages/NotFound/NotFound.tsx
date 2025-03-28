import { Button, Result } from 'antd';
import React from 'react';

const NotFound = () => {
  return (
    <div>
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn đang truy cập không tồn tại."
        extra={
          <button className="hover:bg-primary bg-primary p-2 text-white rounded">
            Quay lại trang chủ
          </button>
        }
      />
    </div>
  );
};

export default NotFound;
