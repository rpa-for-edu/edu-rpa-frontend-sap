import { Step } from 'react-joyride';

export interface TourStep extends Step {
  route?: string;
}

export const steps: TourStep[] = [
  {
    target: 'body',
    content: 'Chào mừng bạn đến với hệ thống ERP-RPA! Dưới đây là hướng dẫn nhanh để giúp bạn làm quen với các tính năng chính.',
    placement: 'center',
    skipBeacon: true,
    route: '/home',
  },
  {
    target: '#sidebar-item--home',
    content: 'Trang chủ: Nơi hiển thị các hoạt động gần đây và truy cập nhanh vào các chức năng của hệ thống.',
    placement: 'right',
    route: '/home',
  },
  {
    target: '#sidebar-item--robot-dashboard',
    content: 'Dashboard: Theo dõi các thống kê và chỉ số hoạt động tổng thể của hệ thống Robot.',
    placement: 'right',
    route: '/robot/dashboard',
  },
  {
    target: '#sidebar-item--studio',
    content: 'Studio: Môi trường thiết kế, nơi bạn có thể xây dựng và vẽ các quy trình làm việc (workflows).',
    placement: 'right',
    route: '/studio',
  },
  {
    target: '#sidebar-item--robot',
    content: 'Robot: Quản lý danh sách các Robot, giao nhiệm vụ và giám sát quy trình thực thi.',
    placement: 'right',
    route: '/robot',
  },
  {
    target: '#sidebar-item--integration-service',
    content: 'Connection (Kết nối hệ thống): Cấu hình và quản lý các kết nối với các dịch vụ bên thứ ba (ERP, Database, v.v.).',
    placement: 'right',
    route: '/integration-service',
  },
  {
    target: '#sidebar-item--storage',
    content: 'Lưu trữ: Nơi lưu trữ, quản lý các tệp tin và tài liệu thiết yếu được sử dụng trong các quy trình.',
    placement: 'right',
    route: '/storage',
  },
  {
    target: '#sidebar-item--document-template',
    content: 'Mẫu tài liệu: Thiết kế và quản lý các loại biểu mẫu, hóa đơn dùng cho việc trích xuất và xử lý dữ liệu tự động.',
    placement: 'right',
    route: '/document-template',
  },
  {
    target: '#sidebar-item--workspace',
    content: 'Không gian làm việc (Workspace): Quản lý và chuyển đổi ngữ cảnh làm việc giữa các nhóm cộng tác khác nhau.',
    placement: 'right',
    route: '/workspace',
  },
  {
    target: 'body',
    content: 'Hướng dẫn đã kết thúc! Bạn đã sẵn sàng để bắt đầu sử dụng ERP-RPA.',
    placement: 'center',
    route: '/home',
  }
];
