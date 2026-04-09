# BÁO CÁO DỰ ÁN: MÔ PHỎNG TRÁI ĐẤT 3D TRONG KHÔNG GIAN VỚI VR

## 1. Thông tin chung
- Tên dự án: Mô phỏng Trái Đất 3D trong không gian
- Công nghệ sử dụng: HTML, CSS, JavaScript, Three.js, WebXR/VR
- Mục tiêu: xây dựng một cảnh 3D mô phỏng Trái Đất, Mặt Trăng, nền sao và thiên hà, có thể quan sát bằng trình duyệt và trải nghiệm trong chế độ VR

## 2. Mục tiêu thực hiện
Dự án được thực hiện với mục tiêu chính là tạo ra một sản phẩm trực quan, có tính tương tác cao và dễ trình bày trong môi trường web. Thay vì đi sâu vào lý thuyết, quá trình làm tập trung vào các bước:
- Tạo cảnh 3D có Trái Đất ở trung tâm
- Bổ sung các lớp hiển thị như mây, ánh sáng ban đêm, nhãn khu vực và Mặt Trăng
- Thêm nền không gian với sao và dải thiên hà
- Tích hợp bảng điều khiển để thay đổi thông số khi chạy
- Hỗ trợ VR để tăng tính trải nghiệm

## 3. Quy trình thực hiện

### 3.1. Khảo sát và xác định yêu cầu
Ở giai đoạn đầu, nhóm xác định sản phẩm cần đạt các yêu cầu sau:
- Hình ảnh phải trực quan, dễ nhìn và có cảm giác không gian
- Trái Đất cần có chuyển động quay và quan sát được từ nhiều góc độ
- Có chế độ VR để người dùng trải nghiệm tương tác sâu hơn
- Có các tuỳ chọn bật/tắt sao, nhãn khu vực và thay đổi mức hiệu năng
- Có cơ chế dự phòng khi thiếu texture thật

### 3.2. Thiết kế cấu trúc dự án
Sau khi chốt yêu cầu, dự án được chia thành các phần rõ ràng:
- File giao diện `index.html` dùng để dựng khung trang và các thành phần điều khiển
- File `src/main.js` xử lý khởi tạo scene, camera, renderer, điều khiển và vòng lặp render
- Thư mục `src/scene/` chứa các module tạo Trái Đất, Mặt Trăng, nền sao, thiên hà và nhãn khu vực
- Thư mục `src/ui/` chứa phần bảng điều khiển
- Thư mục `assets/` lưu các texture phục vụ hiển thị

Cách chia này giúp việc phát triển theo từng module riêng biệt, dễ kiểm tra và dễ thay đổi sau này.

### 3.3. Xây dựng giao diện ban đầu
Phần giao diện được dựng trong `index.html` với:
- Khu vực thông tin ngắn ở góc trang
- Bảng điều khiển gồm preset hiệu năng, bật/tắt sao, bật/tắt nhãn khu vực và nút reset góc nhìn
- Các thanh trượt để chỉnh tốc độ quay Trái Đất, tốc độ quay mây, cường độ ánh sáng Mặt Trời và exposure

Mục tiêu của bước này là tạo ra giao diện đủ dùng ngay từ đầu để có thể điều chỉnh dự án trong quá trình chạy mà không phải sửa code liên tục.

### 3.4. Dựng cảnh 3D chính
Phần cảnh chính được xây dựng trong `src/main.js` theo các bước:
- Tạo scene và world root để gom toàn bộ đối tượng 3D
- Tạo camera phối cảnh phù hợp cho góc nhìn không gian
- Thiết lập các nguồn sáng như ambient light, directional light và point light
- Khởi tạo renderer, bật tone mapping và hỗ trợ WebXR
- Gắn OrbitControls cho chế độ xem trên màn hình thường

Sau đó các đối tượng chính được thêm vào scene:
- Mặt Trời ở một vị trí cố định để tạo hướng sáng chính
- Trái Đất với lớp bề mặt, mây, khí quyển và lớp ánh sáng thành phố ban đêm
- Mặt Trăng quay quanh Trái Đất
- Nền sao và nền thiên hà bao quanh toàn cảnh

### 3.5. Tạo Trái Đất và các lớp hiển thị
Trong `src/scene/earth.js`, Trái Đất được tách thành nhiều lớp để dễ kiểm soát:
- Lớp bề mặt chính
- Lớp mây trong suốt
- Lớp khí quyển
- Lớp trục tham chiếu
- Lớp city lights cho vùng ban đêm

Dự án có hai hướng hiển thị:
- Dùng texture thật nếu có sẵn trong `assets/` hoặc tải được từ nguồn ngoài
- Dùng texture dự phòng procedural nếu thiếu dữ liệu

Cách làm này giúp dự án vẫn chạy ổn trong nhiều môi trường khác nhau, không phụ thuộc hoàn toàn vào tài nguyên bên ngoài.

### 3.6. Bổ sung Mặt Trăng
Phần Mặt Trăng được triển khai trong `src/scene/moon.js`:
- Tạo quỹ đạo xoay quanh Trái Đất
- Tạo chuyển động tự quay nhẹ
- Dùng texture thật nếu tải được, còn không thì dùng vật liệu dự phòng màu xám

Bước này giúp cảnh 3D bớt đơn điệu và tạo cảm giác có hệ Trái Đất - Mặt Trăng hoàn chỉnh hơn.

### 3.7. Tạo nền sao và thiên hà
Phần nền không gian được làm trong `src/scene/starfield.js` và `src/scene/galaxy.js`:
- Sao được tạo ngẫu nhiên trên mặt cầu lớn bao quanh cảnh
- Dải thiên hà được vẽ bằng texture procedural trên canvas
- Có cơ chế loại vùng sáng gần phía Mặt Trời để tránh chói và giữ bố cục hài hòa

Đây là bước quan trọng để tạo chiều sâu cho toàn bộ cảnh và tăng tính thẩm mỹ của sản phẩm.

### 3.8. Tạo nhãn khu vực
Trong `src/scene/regions.js`, nhóm thêm các marker và nhãn cho một số khu vực/thành phố trên Trái Đất:
- Bắc Mỹ, Nam Mỹ, Châu Âu, Châu Phi, Châu Á, Úc
- Một số thành phố như Việt Nam, Tokyo, Seoul, Paris, London, New York...

Mỗi nhãn được gắn theo tọa độ địa lý, giúp người xem dễ nhận biết vị trí trên mô hình Trái Đất.

### 3.9. Tích hợp bảng điều khiển
File `src/ui/controlPanel.js` đảm nhận việc gắn các thành phần điều khiển vào dữ liệu thực tế của scene:
- Slider đổi tốc độ quay Trái Đất và mây
- Slider đổi cường độ đèn Mặt Trời và exposure
- Toggle bật/tắt sao và nhãn khu vực
- Select đổi preset hiệu năng
- Nút reset lại góc nhìn

Phần điều khiển này giúp người dùng có thể thử nhiều trạng thái hiển thị mà không cần can thiệp vào code.

### 3.10. Hỗ trợ VR và tối ưu trải nghiệm
Một phần nổi bật của dự án là hỗ trợ VR:
- Thêm VRButton để vào chế độ VR ngay trên trình duyệt
- Dùng tay cầm phải để xoay và zoom cảnh
- Khi vào VR thì OrbitControls sẽ tắt để tránh xung đột điều khiển
- Có các preset hiệu năng như `quality`, `balanced`, `vrSmooth`

Đây là bước tối ưu quan trọng vì chạy VR cần ổn định hơn so với chế độ xem thường.

## 4. Kết quả đạt được
Sau quá trình triển khai, dự án đạt được các kết quả chính sau:
- Có một mô hình Trái Đất 3D xoay liên tục, nhìn rõ cả ngày và đêm
- Có Mặt Trăng chuyển động quanh Trái Đất
- Có nền sao và thiên hà tạo cảm giác không gian
- Có nhãn khu vực giúp tăng tính trực quan
- Có bảng điều khiển để thay đổi tham số khi chạy
- Có chế độ VR và cơ chế điều khiển bằng tay cầm
- Có cơ chế fallback để dự án vẫn hoạt động khi thiếu texture

## 5. Thuận lợi và khó khăn
### Thuận lợi
- Three.js hỗ trợ tốt cho dựng cảnh 3D trên web
- Cấu trúc module rõ ràng nên dễ tách phần việc
- Có thể kiểm tra kết quả ngay trên trình duyệt
- Các texture dự phòng giúp giảm lỗi khi thiếu tài nguyên

### Khó khăn
- Cần cân bằng giữa chất lượng hình ảnh và hiệu năng, nhất là ở chế độ VR
- Việc đồng bộ texture, ánh sáng và nhãn khu vực phải làm nhiều lần để hình ảnh hợp lý
- Một số tài nguyên ngoài có thể tải chậm hoặc không truy cập được, nên cần phương án dự phòng

## 6. Hướng phát triển tiếp theo
Nếu tiếp tục hoàn thiện, dự án có thể được mở rộng theo các hướng sau:
- Thêm nhiều khu vực và thành phố hơn
- Bổ sung tương tác click để xem thông tin từng vị trí
- Tối ưu chất lượng texture theo thiết bị
- Thêm hiệu ứng chuyển động camera hoặc hành trình bay quanh Trái Đất
- Hoàn thiện giao diện bảng điều khiển cho đẹp và trực quan hơn

## 7. Kết luận
Dự án đã hoàn thành mục tiêu xây dựng một mô hình Trái Đất 3D có tính trực quan cao, hỗ trợ tương tác và VR. Điểm chính của quá trình thực hiện là chia nhỏ hệ thống thành từng module, làm việc theo từng bước từ giao diện, cảnh 3D, texture, nhãn khu vực đến tối ưu hiệu năng. Cách tiếp cận này giúp sản phẩm dễ kiểm soát, dễ mở rộng và phù hợp để trình bày trong báo cáo dự án.

## 8. Tài liệu tham khảo
- Three.js documentation
- WebXR documentation
- Texture nguồn từ các tài nguyên công khai và texture dự phòng tự sinh trong dự án
