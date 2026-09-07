package EazyTech.EazyHire.controllers;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.services.DashboardContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/dashboard") @RequiredArgsConstructor
public class DashboardController{
 private final DashboardContractService dashboard;
 @GetMapping("/stats") public BaseResponse stats(@RequestParam(defaultValue="30d") String range){return BaseResponse.success("Lấy thống kê dashboard thành công",dashboard.getStats(AuthController.currentId(),range));}
 @GetMapping("/charts") public BaseResponse charts(@RequestParam(defaultValue="30d") String range,@RequestParam(defaultValue="applications") String metric){return BaseResponse.success("Lấy dữ liệu biểu đồ thành công",dashboard.getCharts(AuthController.currentId(),range,metric));}
 @GetMapping("/top-jobs") public BaseResponse topJobs(@RequestParam(defaultValue="30d") String range,@RequestParam(defaultValue="5") int limit){return BaseResponse.success("Lấy danh sách job nổi bật thành công",dashboard.getTopJobs(AuthController.currentId(),range,limit));}
 @GetMapping("/todos") public BaseResponse todos(){return BaseResponse.success("Lấy công việc cần làm thành công",dashboard.getTodos(AuthController.currentId()));}
}
