# NỘI DUNG SLIDE THUYẾT TRÌNH

## Slide 1. Trang bìa
- Đề tài: Xây dựng ứng dụng mô phỏng Trái Đất 3D trong không gian có hỗ trợ thực tế ảo (VR)
- Sinh viên thực hiện: [Điền họ tên]
- MSSV: [Điền MSSV]
- Lớp: [Điền lớp]
- Giảng viên hướng dẫn: [Điền tên giảng viên]

---

## Slide 2. Giới thiệu đề tài
- Xây dựng ứng dụng web mô phỏng Trái Đất 3D trong không gian.
- Hỗ trợ quan sát và tương tác trực tiếp trên trình duyệt.
- Cho phép trải nghiệm ở cả chế độ thường và chế độ VR.
- Bổ sung các thành phần như Mặt Trăng, vệ tinh, sao, thiên hà và thông tin khu vực.

---

## Slide 3. Lý do chọn đề tài
- Công nghệ đồ họa 3D trên web đang phát triển mạnh.
- Three.js cho phép xây dựng mô hình 3D trực quan trên trình duyệt.
- WebXR giúp mở rộng trải nghiệm từ 2D sang thực tế ảo.
- Trái Đất là đối tượng quen thuộc, phù hợp để mô phỏng trực quan.
- Đề tài kết hợp được kiến thức lập trình web, đồ họa máy tính và tương tác người dùng.

---

## Slide 4. Mục tiêu đề tài
- Xây dựng mô hình Trái Đất 3D quay quanh trục.
- Tạo môi trường không gian có tính trực quan cao.
- Tích hợp các đối tượng phụ để tăng tính sinh động.
- Hỗ trợ thay đổi thông số theo thời gian thực.
- Hỗ trợ trải nghiệm thực tế ảo bằng WebXR.

---

## Slide 5. Mục tiêu cụ thể
- Mô phỏng Trái Đất với bề mặt, mây, khí quyển và ánh sáng.
- Tái hiện hiệu ứng ngày đêm và đèn thành phố ban đêm.
- Mô phỏng Mặt Trăng quay quanh Trái Đất.
- Bổ sung vệ tinh chuyển động trên quỹ đạo.
- Xây dựng nền sao và thiên hà làm bối cảnh.
- Hiển thị khu vực, thành phố, tọa độ và múi giờ.
- Cho phép người dùng tương tác với mô hình và giao diện điều khiển.

---

## Slide 6. Đối tượng và phạm vi nghiên cứu
- Đối tượng nghiên cứu: ứng dụng web đồ họa 3D mô phỏng Trái Đất.
- Công nghệ chính: JavaScript, Three.js, WebXR.
- Tập trung vào tính trực quan, khả năng tương tác và trải nghiệm người dùng.
- Không đi sâu vào mô phỏng thiên văn chính xác tuyệt đối.
- Phục vụ mục đích học tập, minh họa và trình diễn công nghệ.

---

## Slide 7. Công nghệ sử dụng
- JavaScript: xử lý logic ứng dụng.
- Three.js: dựng scene, camera, ánh sáng và đối tượng 3D.
- WebXR: hỗ trợ chế độ VR.
- OrbitControls: hỗ trợ điều khiển góc nhìn trong chế độ thường.
- HTML/CSS: xây dựng giao diện và bảng điều khiển.
- Import map/CDN: nạp thư viện trực tiếp, triển khai đơn giản.

---

## Slide 8. Kiến trúc tổng thể hệ thống

```text
                    NGƯỜI DÙNG
                         |
         +---------------+---------------+
         |                               |
  Chế độ thường                    Chế độ VR
         |                               |
         +---------------+---------------+
                         |
                 GIAO DIỆN ĐIỀU KHIỂN
                         |
                 BỘ ĐIỀU PHỐI ỨNG DỤNG
                         |
    +----------+---------+---------+----------+----------+
    |          |                   |          |          |
 Scene     Earth System       Space System   Labels   WebXR
 Engine    (đất, mây, khí     (Mặt Trăng,    & Info   Support
           quyển, ánh sáng)   vệ tinh, sao)
                         |
                  Renderer + Animation Loop
```

**Ý trình bày:**
- Hệ thống được thiết kế theo hướng module hóa.
- Mỗi khối đảm nhận một nhóm chức năng riêng nhưng cùng phối hợp trong một scene 3D.
- Cấu trúc này giúp dễ quản lý, dễ kiểm thử và thuận tiện mở rộng về sau.

---

## Slide 9. Các module chính

| Nhóm module | Thành phần | Vai trò chính |
|---|---|---|
| Nền tảng | Scene, Camera, Renderer, Animation Loop | Khởi tạo và duy trì không gian mô phỏng |
| Mô hình trung tâm | Earth module | Tạo Trái Đất, mây, khí quyển, hiệu ứng ngày đêm |
| Không gian phụ trợ | Moon, Satellite, Stars, Galaxy | Tăng tính trực quan và chiều sâu bối cảnh |
| Tương tác dữ liệu | Labels, Region Info | Hiển thị địa danh, tọa độ, múi giờ |
| Điều khiển | Mission Control UI | Cho phép thay đổi thông số thời gian thực |
| Thực tế ảo | WebXR, VRButton | Chuyển sang trải nghiệm VR |

**Thông điệp chính:** Hệ thống không phải một khối duy nhất, mà là tập hợp các module chuyên trách cùng vận hành đồng bộ.

---

## Slide 10. Mô hình Trái Đất 3D

```text
Trái Đất 3D
├─ Lớp bề mặt
│  └─ Texture lục địa và đại dương
├─ Lớp mây
│  └─ Quay độc lập để tạo cảm giác động
├─ Lớp khí quyển
│  └─ Tăng chiều sâu và hiệu ứng phát sáng rìa
└─ Hệ ánh sáng
   ├─ Vùng ngày / đêm
   └─ Đèn thành phố ban đêm
```

**Cách mô tả khi thuyết trình:** Trái Đất không chỉ là một quả cầu đơn giản, mà là mô hình nhiều lớp để tăng tính chân thực và sinh động.

---

## Slide 11. Không gian mô phỏng

### Các thành phần xung quanh Trái Đất
- Mặt Trăng chuyển động quanh Trái Đất.
- Vệ tinh nhân tạo chuyển động trên quỹ đạo riêng.
- Nền sao tạo cảm giác không gian vũ trụ.
- Nền thiên hà giúp cảnh có chiều sâu hơn.

### Hệ ánh sáng
| Nguồn sáng | Vai trò |
|---|---|
| Ánh sáng môi trường | Giữ tổng thể cảnh không quá tối |
| Ánh sáng Mặt Trời | Tạo chiếu sáng chính và hiệu ứng ngày đêm |
| Ánh sáng phụ trợ | Tăng độ rõ ở một số góc nhìn |

---

## Slide 12. Giao diện điều khiển

```text
              GIAO DIỆN ỨNG DỤNG
   +-------------------------------------------+
   |            Vùng hiển thị 3D               |
   |      Trái Đất và không gian mô phỏng      |
   +-------------------------------------------+
   |         Mission Control / Control Panel   |
   |  preset | labels | stars | speed | light  |
   +-------------------------------------------+
```

**Nhấn mạnh khi trình bày:**
- Khu vực trung tâm dành cho quan sát mô hình.
- Bảng “Mission Control” dùng để thao tác trực tiếp với hệ thống.
- Mọi thay đổi được cập nhật theo thời gian thực nên rất thuận tiện để trình diễn.

---

## Slide 13. Các chức năng điều khiển

| Nhóm chức năng | Nội dung điều khiển |
|---|---|
| Preset hiệu năng | `Quality`, `Balanced`, `VR Smooth` |
| Hiển thị | Bật/tắt sao, bật/tắt nhãn địa danh, xem tọa độ |
| Chuyển động | Điều chỉnh tốc độ quay Trái Đất và mây |
| Ánh sáng | Điều chỉnh cường độ ánh sáng Mặt Trời, mức phơi sáng |
| Camera | Reset góc nhìn |

**Nhận xét:** Các chức năng được tổ chức theo nhóm nên người dùng dễ hiểu và thao tác nhanh hơn.

---

## Slide 14. Các góc nhìn đặc biệt

### Sơ đồ góc nhìn
```text
Người quan sát
   |
   +-- Góc mặc định: quan sát toàn cảnh từ không gian
   +-- Góc vệ tinh: theo dõi Trái Đất từ quỹ đạo gần
   +-- Góc Mặt Trăng: nhìn Trái Đất từ vị trí của Mặt Trăng
   +-- Góc Mặt Trời: quan sát hướng chiếu sáng chính
```

### Ý nghĩa
- Giúp người dùng nhìn cùng một mô hình ở nhiều bối cảnh khác nhau.
- Tăng giá trị minh họa, đặc biệt khi thuyết trình và demo.

---

## Slide 15. Nhãn địa lý và thông tin khu vực

| Thành phần thông tin | Nội dung hiển thị |
|---|---|
| Địa danh | Tên khu vực, tên thành phố |
| Vị trí | Tọa độ địa lý |
| Thời gian | Múi giờ địa phương, giờ hiện tại, giờ UTC |
| Tương tác | Chọn từng vị trí để xem chi tiết |

**Luồng sử dụng:**
`Chọn khu vực -> Hệ thống lấy dữ liệu vị trí -> Hiển thị tọa độ và thời gian tương ứng`

---

## Slide 16. Hỗ trợ thực tế ảo VR

```text
Trình duyệt hỗ trợ WebXR
          |
       VRButton
          |
    Kích hoạt phiên VR
          |
 Người dùng bước vào không gian mô phỏng
          |
   Tương tác với góc nhìn nhập vai hơn
```

**Điểm nổi bật:**
- Cho phép chuyển từ trải nghiệm quan sát trên màn hình sang trải nghiệm nhập vai.
- Preset `VR Smooth` giúp tối ưu hiệu năng cho môi trường VR.
- Đây là điểm nhấn hiện đại, làm đề tài nổi bật hơn so với mô phỏng web thông thường.

---

## Slide 17. Kết quả đạt được

### Đã hoàn thành
- Xây dựng ứng dụng mô phỏng Trái Đất 3D chạy trên trình duyệt.
- Tái hiện Trái Đất với mây, khí quyển và ánh sáng.
- Mô phỏng được Mặt Trăng và vệ tinh quay quanh Trái Đất.
- Xây dựng nền sao, thiên hà và bảng điều khiển tương tác.
- Hiển thị thông tin khu vực theo tọa độ và múi giờ.
- Tích hợp được chế độ VR bằng WebXR.

### Giá trị đạt được
| Về kỹ thuật | Về trải nghiệm |
|---|---|
| Kết hợp web, đồ họa 3D và VR | Trực quan, sinh động, dễ trình diễn |

---

## Slide 18. Ưu điểm của hệ thống

| Tiêu chí | Điểm mạnh |
|---|---|
| Trực quan | Mô hình 3D đẹp, dễ quan sát |
| Tương tác | Có nhiều thao tác điều chỉnh thời gian thực |
| Trình diễn | Hỗ trợ nhiều góc nhìn và bảng điều khiển rõ ràng |
| Thông tin | Có dữ liệu khu vực theo tọa độ và múi giờ |
| Khác biệt | Tích hợp VR tạo điểm nhấn |
| Mở rộng | Cấu trúc mã nguồn rõ ràng, dễ phát triển thêm |

---

## Slide 19. Hạn chế của hệ thống

### Hạn chế hiện tại
1. Độ chính xác thiên văn chưa ở mức mô phỏng khoa học chuyên sâu.
2. Dữ liệu khu vực vẫn còn cơ bản.
3. Chưa mở rộng sang toàn bộ Hệ Mặt Trời.
4. Hiệu năng còn phụ thuộc vào cấu hình thiết bị.
5. Trải nghiệm VR cần phần cứng hỗ trợ WebXR.

### Kết luận ngắn
Hệ thống phù hợp cho mục đích học tập, minh họa và trình diễn công nghệ hơn là mô phỏng thiên văn chuyên nghiệp.

---

## Slide 20. Hướng phát triển

```text
Phiên bản hiện tại
      |
      +-- Mở rộng mô hình -> thêm các hành tinh khác
      +-- Mở rộng dữ liệu -> quỹ đạo thật, dữ liệu địa lý sâu hơn
      +-- Mở rộng tương tác -> chọn đối tượng, phân tích khu vực
      +-- Tối ưu hệ thống -> mobile, kính VR, hiệu năng
      +-- Mở rộng ứng dụng -> học tập và trình diễn khoa học
```

---

## Slide 21. Kết luận

**Tóm tắt 4 ý chính**
1. Đề tài đã xây dựng được ứng dụng mô phỏng Trái Đất 3D trực quan và có tương tác tốt.
2. Hệ thống không chỉ có Trái Đất mà còn bổ sung Mặt Trăng, vệ tinh, sao và thông tin khu vực.
3. Ứng dụng thể hiện khả năng áp dụng công nghệ web hiện đại vào đồ họa 3D.
4. Đây là nền tảng tốt để tiếp tục mở rộng trong tương lai.

---

## Slide 22. Lời cảm ơn
- Xin chân thành cảm ơn thầy cô và các bạn đã lắng nghe.
