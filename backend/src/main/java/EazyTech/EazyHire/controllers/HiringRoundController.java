package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.services.HiringRoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/rounds")
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
@RequiredArgsConstructor
public class HiringRoundController {
    private final HiringRoundService hiringRoundService;

    @GetMapping
    public ResponseEntity<BaseResponse> getRounds(@PathVariable Long jobId) {
        AuthorizedUser currentUser = user();
        return ResponseEntity.ok(BaseResponse.success("Lấy danh sách vòng tuyển dụng thành công", hiringRoundService.getRounds(jobId, currentUser.getCompanyId(), currentUser.getId())));
    }
    @PostMapping
    public ResponseEntity<BaseResponse> createRound(@PathVariable Long jobId, @Valid @RequestBody HiringRoundRequestDTO request) {
        AuthorizedUser currentUser = user();
        return ResponseEntity.ok(BaseResponse.success("Tạo vòng tuyển dụng thành công", hiringRoundService.createRound(jobId, currentUser.getCompanyId(), currentUser.getId(), request)));
    }
    @PutMapping("/{roundId}")
    public ResponseEntity<BaseResponse> updateRound(@PathVariable Long jobId, @PathVariable Long roundId, @Valid @RequestBody HiringRoundRequestDTO request) {
        AuthorizedUser currentUser = user();
        return ResponseEntity.ok(BaseResponse.success("Cập nhật vòng tuyển dụng thành công", hiringRoundService.updateRound(jobId, roundId, currentUser.getCompanyId(), currentUser.getId(), request)));
    }
    @DeleteMapping("/{roundId}")
    public ResponseEntity<BaseResponse> deleteRound(@PathVariable Long jobId, @PathVariable Long roundId) {
        AuthorizedUser currentUser = user();
        hiringRoundService.deleteRound(jobId, roundId, currentUser.getCompanyId(), currentUser.getId());
        return ResponseEntity.ok(BaseResponse.success("Xóa vòng tuyển dụng thành công"));
    }
    @PutMapping("/reorder")
    public ResponseEntity<BaseResponse> reorderRounds(@PathVariable Long jobId, @Valid @RequestBody ReorderHiringRoundsRequestDTO request) {
        AuthorizedUser currentUser = user();
        return ResponseEntity.ok(BaseResponse.success("Sắp xếp vòng tuyển dụng thành công", hiringRoundService.reorderRounds(jobId, currentUser.getCompanyId(), currentUser.getId(), request.getOrderedIds())));
    }
    private AuthorizedUser user() { return SecurityUtils.getCurrentUser().orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập")); }
}
