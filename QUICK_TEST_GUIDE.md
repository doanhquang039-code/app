# 🚀 Quick Test Guide - New Frontend Pages

Hướng dẫn nhanh để test 4 trang mới hoàn thành: AI Insights, Social, Gamification, Settings

---

## 📋 Chuẩn bị

### 1. Khởi động Backend & Frontend

```bash
# Terminal 1 - Backend
cd app/backend
npm run start:dev

# Terminal 2 - Frontend
cd app/frontend
npm run dev
```

### 2. Đăng nhập

- URL: http://localhost:5173
- Username: `testuser`
- Password: `password123`

---

## 🧪 Test AI Insights Page

### URL: http://localhost:5173/ai-insights

### Test Cases:

#### 1. Xem Tổng quan
- ✅ Kiểm tra 3 thẻ thống kê (Mẫu phát hiện, Chi tiêu bất thường, Dự đoán)
- ✅ Xem khuyến nghị từ AI
- ✅ Xem mẫu chi tiêu gần đây

#### 2. Phân tích Mẫu Chi tiêu
- ✅ Click nút "Phân tích mẫu"
- ✅ Chuyển sang tab "Mẫu chi tiêu"
- ✅ Xem danh sách mẫu đã phát hiện
- ✅ Kiểm tra badge độ tin cậy

#### 3. Phát hiện Chi tiêu Bất thường
- ✅ Click nút "Phát hiện bất thường"
- ✅ Chuyển sang tab "Chi tiêu bất thường"
- ✅ Xem danh sách giao dịch bất thường
- ✅ Click "Xác nhận" hoặc "Bỏ qua" cho một bất thường

#### 4. Tạo Dự đoán
- ✅ Click nút "Dự đoán chi tiêu"
- ✅ Chuyển sang tab "Dự đoán"
- ✅ Xem danh sách dự đoán
- ✅ Kiểm tra progress bar độ tin cậy

### Expected Results:
- Toast notification hiển thị khi thực hiện hành động
- Dữ liệu cập nhật real-time
- UI responsive và mượt mà

---

## 👥 Test Social Page

### URL: http://localhost:5173/social

### Test Cases:

#### 1. Tìm kiếm & Kết bạn
- ✅ Nhập tên hoặc email vào search bar
- ✅ Click nút "Kết bạn" cho một người dùng
- ✅ Kiểm tra toast notification

#### 2. Quản lý Lời mời Kết bạn
- ✅ Xem danh sách lời mời kết bạn
- ✅ Click nút "✓" để chấp nhận
- ✅ Click nút "✗" để từ chối

#### 3. Xem Danh sách Bạn bè
- ✅ Scroll xuống xem danh sách bạn bè
- ✅ Kiểm tra grid layout responsive

#### 4. Thử thách Chi tiêu
- ✅ Chuyển sang tab "Thử thách"
- ✅ Xem "Thử thách của tôi"
- ✅ Xem "Thử thách công khai"
- ✅ Click "Tham gia" cho một thử thách công khai
- ✅ Click "Xếp hạng" để xem leaderboard
- ✅ Click "Rời" để rời khỏi thử thách

### Expected Results:
- Search hoạt động real-time
- Friend requests cập nhật ngay lập tức
- Leaderboard modal hiển thị đúng
- Badge màu sắc theo loại thử thách

---

## 🏆 Test Gamification Page

### URL: http://localhost:5173/gamification

### Test Cases:

#### 1. Xem Tổng quan
- ✅ Kiểm tra thẻ rank với gradient màu
- ✅ Xem tổng điểm, cấp độ, chuỗi đăng nhập
- ✅ Xem lịch sử điểm

#### 2. Điểm danh Hàng ngày
- ✅ Click nút "Điểm danh"
- ✅ Kiểm tra chuỗi đăng nhập tăng
- ✅ Kiểm tra điểm thưởng

#### 3. Xem Thành tích
- ✅ Chuyển sang tab "Thành tích"
- ✅ Xem thành tích đã mở khóa (border xanh)
- ✅ Xem tất cả thành tích với progress bar
- ✅ Kiểm tra icon động theo loại

#### 4. Kiểm tra Thành tích
- ✅ Click nút "Kiểm tra thành tích"
- ✅ Xem thành tích mới được mở khóa

#### 5. Xem Bảng Xếp hạng
- ✅ Chuyển sang tab "Bảng xếp hạng"
- ✅ Xem top 50 người dùng
- ✅ Kiểm tra icon vương miện cho top 3
- ✅ Kiểm tra gradient background

### Expected Results:
- Rank gradient hiển thị đẹp
- Progress bar cập nhật chính xác
- Leaderboard highlight top 3
- Toast notification khi điểm danh

---

## ⚙️ Test Settings Page

### URL: http://localhost:5173/settings

### Test Cases:

#### 1. Cập nhật Thông tin Cá nhân
- ✅ Chuyển sang tab "Thông tin cá nhân"
- ✅ Thay đổi tên đầy đủ
- ✅ Thay đổi username
- ✅ Thay đổi email
- ✅ Click "Lưu thay đổi"

#### 2. Đổi Mật khẩu
- ✅ Chuyển sang tab "Bảo mật"
- ✅ Nhập mật khẩu hiện tại
- ✅ Nhập mật khẩu mới
- ✅ Nhập xác nhận mật khẩu
- ✅ Click icon Eye/EyeOff để show/hide password
- ✅ Click "Đổi mật khẩu"

#### 3. Xuất Dữ liệu
- ✅ Scroll xuống phần "Quản lý dữ liệu"
- ✅ Click "Xuất dữ liệu"
- ✅ Kiểm tra file JSON được tải xuống

#### 4. Cài đặt Thông báo
- ✅ Chuyển sang tab "Thông báo"
- ✅ Toggle các loại thông báo
- ✅ Click "Lưu cài đặt"

#### 5. Tùy chọn Hiển thị
- ✅ Chuyển sang tab "Tùy chọn"
- ✅ Thay đổi đơn vị tiền tệ
- ✅ Thay đổi ngôn ngữ
- ✅ Thay đổi giao diện
- ✅ Thay đổi định dạng ngày
- ✅ Click "Lưu tùy chọn"

### Expected Results:
- Form validation hoạt động
- Password show/hide toggle hoạt động
- File export thành công
- Toggle switches hoạt động mượt
- Toast notification hiển thị

---

## 🔍 Kiểm tra Responsive Design

### Desktop (1920x1080):
- ✅ Layout rộng rãi
- ✅ Grid 3 cột cho cards
- ✅ Sidebar đầy đủ

### Tablet (768x1024):
- ✅ Grid 2 cột
- ✅ Sidebar thu gọn
- ✅ Touch-friendly buttons

### Mobile (375x667):
- ✅ Grid 1 cột
- ✅ Hamburger menu
- ✅ Stack layout
- ✅ Bottom navigation

---

## 🐛 Common Issues & Solutions

### Issue 1: API không kết nối
**Solution:**
```bash
# Kiểm tra backend đang chạy
curl http://localhost:3000/api/health

# Kiểm tra proxy trong vite.config.ts
```

### Issue 2: Toast không hiển thị
**Solution:**
- Kiểm tra `<Toaster />` trong `App.tsx`
- Kiểm tra import `sonner`

### Issue 3: TypeScript errors
**Solution:**
```bash
cd app/frontend
npm run build
# Xem lỗi TypeScript
```

### Issue 4: 401 Unauthorized
**Solution:**
- Đăng xuất và đăng nhập lại
- Kiểm tra token trong localStorage
- Kiểm tra JWT_SECRET trong backend/.env

---

## ✅ Checklist Test Hoàn chỉnh

### AI Insights:
- [ ] Xem tổng quan
- [ ] Phân tích mẫu
- [ ] Phát hiện bất thường
- [ ] Tạo dự đoán
- [ ] Cập nhật trạng thái bất thường

### Social:
- [ ] Tìm kiếm người dùng
- [ ] Gửi lời mời kết bạn
- [ ] Chấp nhận/Từ chối lời mời
- [ ] Xem danh sách bạn bè
- [ ] Tham gia thử thách
- [ ] Xem leaderboard

### Gamification:
- [ ] Xem thống kê
- [ ] Điểm danh hàng ngày
- [ ] Xem thành tích
- [ ] Kiểm tra thành tích mới
- [ ] Xem bảng xếp hạng

### Settings:
- [ ] Cập nhật thông tin
- [ ] Đổi mật khẩu
- [ ] Xuất dữ liệu
- [ ] Cài đặt thông báo
- [ ] Tùy chọn hiển thị

---

## 📊 Performance Metrics

### Target Metrics:
- **Page Load:** < 2s
- **API Response:** < 100ms
- **UI Interaction:** < 50ms
- **Bundle Size:** < 500KB

### Tools:
- Chrome DevTools (Network, Performance)
- Lighthouse
- React DevTools Profiler

---

## 🎉 Test Completion

Khi hoàn thành tất cả test cases:
1. ✅ Tất cả trang load thành công
2. ✅ Tất cả API calls hoạt động
3. ✅ Tất cả UI interactions mượt mà
4. ✅ Responsive design hoạt động
5. ✅ Toast notifications hiển thị đúng
6. ✅ Form validation hoạt động
7. ✅ Error handling đúng

**Congratulations! 🎊 Frontend đã sẵn sàng production!**

---

**Test Date:** April 27, 2026  
**Tester:** [Your Name]  
**Status:** ✅ PASSED / ❌ FAILED  
**Notes:** [Add any notes here]
