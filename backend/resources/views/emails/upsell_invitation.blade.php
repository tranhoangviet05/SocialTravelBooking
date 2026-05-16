<x-mail::message>
# Chào {{ $userName }},

Cảm ơn bạn đã tin tưởng đặt dịch vụ **{{ $serviceName }}** trên hệ thống của chúng tôi!

Dựa trên đơn hàng của bạn, chúng tôi nhận thấy bạn đủ điều kiện tham gia chương trình **Nâng cấp Đặc biệt** từ nhà cung cấp.

### Ưu đãi dành riêng cho bạn:
*   **Nâng cấp phòng:** Từ phòng tiêu chuẩn lên phòng **{{ $targetRoom }}** sang trọng hơn.
*   **Quà tặng kèm:** Bạn có thể nhận thêm các voucher giảm giá cho các dịch vụ đi kèm (xe đưa đón, tour tham quan...) nếu có trong chương trình.

Đừng bỏ lỡ cơ hội tận hưởng chuyến đi trọn vẹn hơn với mức giá ưu đãi nhất!

<x-mail::button :url="$upgradeUrl">
Xem chi tiết & Nâng cấp ngay
</x-mail::button>

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.

Trân trọng,<br>
Đội ngũ {{ config('app.name') }}
</x-mail::message>
