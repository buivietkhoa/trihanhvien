# MandarinConnect

Front-end website học tiếng Trung 1:1, đủ 17 màn hình M01–M17 theo sitemap và thiết kế Figma (tuần 5–8).

## Công nghệ

- ReactJS + TypeScript, Vite
- TailwindCSS (bảng màu `@theme`) và CSS thuần trong `src/styles`
- React Router, lucide-react
- JSON Server cho dữ liệu giả lập

## Chạy dự án

Mở hai terminal:

```bash
npm install
npm run mock   # Mock API tại http://localhost:3001 (sửa tay db.json thì cần tắt và chạy lại)
npm run dev    # Website tại http://localhost:5173
```

Tài khoản demo: `lan@example.com` / `matkhau123`. Kiểm tra bản build bằng `npm run build`.

## Triển khai (Vercel)

- Bản build (`npm run build`) không cần JSON Server: web dùng máy chủ giả lập trong trình duyệt (`src/services/localApi.ts`), nạp sẵn dữ liệu từ `db.json` và lưu thay đổi vào `localStorage` của từng người xem.
- `vercel.json` chuyển mọi đường dẫn về `index.html` để mở thẳng link như `/teachers/t1` không bị lỗi 404.
- Trên Vercel: Import repo GitHub → Framework **Vite** → Build `npm run build` → Output `dist`. Không cần biến môi trường.
- Muốn bản triển khai gọi tới một JSON Server thật, đặt `VITE_API_URL` là địa chỉ server đó.

## Màn hình

| Mã | Đường dẫn | Màn hình | Cần đăng nhập |
|---|---|---|---|
| M01–M03 | `/login`, `/register`, `/forgot-password` | Đăng nhập, Đăng ký, Quên mật khẩu | |
| M04–M05 | `/`, `/teachers` | Trang chủ, Danh sách giáo viên | |
| M06 | `/teachers/:id` | Hồ sơ giáo viên | |
| M07–M08 | `/courses`, `/courses/:id` | Danh sách và chi tiết khoá học | |
| M09–M11 | `/booking/:teacherId`, `/booking/confirm`, `/booking/success` | Đặt lịch, Xác nhận, Thành công | ✓ |
| M12 | `/wallet` | Ví coin, nạp coin (mô phỏng) | ✓ |
| M13 | `/dashboard` | Dashboard, huỷ và đổi lịch | ✓ |
| M14 | `/history` | Lịch sử buổi học, đánh giá giáo viên | ✓ |
| M15 | `/settings` | Cài đặt tài khoản, đổi mật khẩu | ✓ |
| M16–M17 | `/contact`, `/faq` | Liên hệ hỗ trợ, Câu hỏi thường gặp | |

## Cấu trúc

- `src/pages`: các màn hình (luồng đặt lịch trong `pages/booking`)
- `src/components`: Header, Footer, thẻ giáo viên/khoá học, popup (`modals.tsx`), lưới khung giờ (`SlotGrid.tsx`)
- `src/context`: đăng nhập (`AuthContext`) và thông báo (`ToastContext`)
- `src/services/api.ts`: gọi Mock API; `services/actions.ts`: nghiệp vụ đặt lịch, huỷ, đổi lịch, nạp coin, đánh giá
- `src/utils`: định dạng tiền/coin, ngày giờ, tính khung giờ trống
- `db.json`: dữ liệu giả lập (giáo viên, khoá học, học viên, buổi học, giao dịch, đánh giá, FAQ, yêu cầu hỗ trợ)

## Quy tắc nghiệp vụ

- 1 coin = 1.000đ; mỗi buổi học là một ca 90 phút, học phí = giá theo giờ × 1,5.
- Mỗi ngày có 6 ca cố định: 08:00–09:30, 10:00–11:30, 14:00–15:30, 16:00–17:30, 18:00–19:30, 20:00–21:30; chỉ chọn được ca còn trống.
- Huỷ được bất cứ lúc nào trước giờ học, hoàn 100% coin; buổi đã bắt đầu thì không huỷ được.
- Đổi lịch giữ nguyên thời lượng và học phí, chọn một ca còn trống trong 7 ngày tới.
- Chỉ buổi đã hoàn thành mới được đánh giá; mỗi buổi một lần, sửa được trong 7 ngày.

## Lưu ý về bản demo

- "Thời điểm hiện tại" của bản demo cố định là Thứ Năm 22/10/2026 15:45, khớp kịch bản Figma. Đặt `VITE_DEMO_NOW=real` để dùng giờ thật của máy.
- Đăng nhập, thanh toán và gửi email đều là mô phỏng. Mật khẩu lưu dạng chữ thường trong `db.json` nên chỉ dùng cho demo.
- Lịch bận của giáo viên được sinh cố định theo thuật toán, kết hợp với các buổi đã đặt thật trong `db.json`.
