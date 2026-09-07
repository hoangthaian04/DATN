package EazyTech.EazyHire.services;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.*;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.core.exceptions.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @RequiredArgsConstructor
public class UserAccountService {
 private final UserRepository users;
 public UserEntity getUser(Long id) { return users.findByIdWithCompany(id).orElseThrow(()->new CustomException(401,"Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại.")); }
 public void requireAllowed(UserEntity user) {
  if (user.getStatus()==UserStatus.INACTIVE || user.getStatus()==UserStatus.BLOCKED ||
      (user.getCompany()!=null && user.getCompany().getStatus()==CompanyStatus.BLOCKED))
   throw new CustomException(403,"Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
 }
 public UserEntity requireHr(Long id, boolean active) {
  UserEntity user=getUser(id); requireAllowed(user);
  if(user.getRole()==UserRole.ADMIN || user.getCompany()==null ||
    (active && (user.getStatus()!=UserStatus.ACTIVE || user.getCompany().getStatus()!=CompanyStatus.ACTIVE)))
   throw new CustomException(403,"Tài khoản chưa đủ điều kiện truy cập workspace.");
  return user;
 }
 public UserEntity requireAdmin(Long id) {
  UserEntity user=getUser(id);
  if(user.getRole()!=UserRole.ADMIN || user.getStatus()!=UserStatus.ACTIVE)
   throw new CustomException(403,"Bạn không có quyền quản trị.");
  return user;
 }
 public List<UserEntity> getCompanyUsers(Long id){ return users.findByCompanyId(id); }
 @Transactional public void activateCompanyUsers(Long id, UserStatus status){
  for(UserEntity u:users.findByCompanyId(id)) {
   if(u.getRole()!=UserRole.ADMIN && u.getStatus()!=UserStatus.INACTIVE && u.getStatus()!=UserStatus.BLOCKED)u.setStatus(status);
  }
 }
}
