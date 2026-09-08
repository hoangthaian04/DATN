package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.services.HiringRoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/rounds")
@RequiredArgsConstructor
public class HiringRoundController {
    private final HiringRoundService hiringRoundService;

    @GetMapping
    public ResponseEntity<BaseResponse> getRounds(@PathVariable Long jobId) {
        return ResponseEntity.ok(BaseResponse.success("Lấy danh sách vòng tuyển dụng thành công", hiringRoundService.getRounds(jobId, user().getCompanyId())));
    }
    @PostMapping
    public ResponseEntity<BaseResponse> createRound(@PathVariable Long jobId, @Valid @RequestBody HiringRoundRequestDTO request) {
        return ResponseEntity.ok(BaseResponse.success("Tạo vòng tuyển dụng thành công", hiringRoundService.createRound(jobId, user().getCompanyId(), request)));
    }
    @PutMapping("/{roundId}")
    public ResponseEntity<BaseResponse> updateRound(@PathVariable Long jobId, @PathVariable Long roundId, @Valid @RequestBody HiringRoundRequestDTO request) {
        return ResponseEntity.ok(BaseResponse.success("Cập nhật vòng tuyển dụng thành công", hiringRoundService.updateRound(jobId, roundId, user().getCompanyId(), request)));
    }
    @DeleteMapping("/{roundId}")
    public ResponseEntity<BaseResponse> deleteRound(@PathVariable Long jobId, @PathVariable Long roundId) {
        hiringRoundService.deleteRound(jobId, roundId, user().getCompanyId());
        return ResponseEntity.ok(BaseResponse.success("Xóa vòng tuyển dụng thành công"));
    }
    @PutMapping("/reorder")
    public ResponseEntity<BaseResponse> reorderRounds(@PathVariable Long jobId, @Valid @RequestBody ReorderHiringRoundsRequestDTO request) {
        return ResponseEntity.ok(BaseResponse.success("Sắp xếp vòng tuyển dụng thành công", hiringRoundService.reorderRounds(jobId, user().getCompanyId(), request.getOrderedIds())));
    }
    private AuthorizedUser user() { return SecurityUtils.getCurrentUser().orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập")); }
}
