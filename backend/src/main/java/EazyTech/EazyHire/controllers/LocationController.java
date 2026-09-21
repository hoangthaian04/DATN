package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.services.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/provinces")
    public ResponseEntity<BaseResponse> getProvinces() {
        return ResponseEntity.ok(new BaseResponse(1, "Lấy danh sách tỉnh thành thành công", locationService.getProvinces()));
    }

    @GetMapping("/provinces/{provinceCode}/wards")
    public ResponseEntity<BaseResponse> getWards(@PathVariable String provinceCode) {
        return ResponseEntity.ok(new BaseResponse(1, "Lấy danh sách xã phường thành công", locationService.getWards(provinceCode)));
    }
}
