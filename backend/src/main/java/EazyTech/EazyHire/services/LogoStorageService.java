package EazyTech.EazyHire.services;
import EazyTech.EazyHire.core.exceptions.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.*;
@Service
public class LogoStorageService {
 private final Path root;
 public LogoStorageService(@Value("${app.upload-dir:uploads}") String dir){root=Path.of(dir).toAbsolutePath().normalize();}
 public String storeLogo(Long companyId,MultipartFile file){
  if(file==null || file.isEmpty() || file.getSize()>2*1024*1024)throw new CustomException(400,"Logo không hợp lệ hoặc vượt quá 2MB.");
  String name=Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
  String ext=name.substring(name.lastIndexOf('.')+1);
  String mime=file.getContentType();
  if(!Set.of("png","jpg","jpeg","webp").contains(ext) || mime==null ||
     !Set.of("image/png","image/jpeg","image/webp").contains(mime))throw new CustomException(415,"Chỉ nhận ảnh PNG, JPG, JPEG hoặc WEBP.");
  try{
   byte[] bytes=file.getBytes();
   boolean png=bytes.length>8 && bytes[0]==(byte)137 && bytes[1]==80 && bytes[2]==78 && bytes[3]==71;
   boolean jpg=bytes.length>3 && bytes[0]==(byte)255 && bytes[1]==(byte)216 && bytes[2]==(byte)255;
   boolean webp=bytes.length>12 && new String(bytes,0,4,java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF") && new String(bytes,8,4,java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP");
   if(!(png && ext.equals("png") && mime.equals("image/png") || jpg && Set.of("jpg","jpeg").contains(ext) && mime.equals("image/jpeg") || webp && ext.equals("webp") && mime.equals("image/webp")))
    throw new CustomException(415,"Nội dung ảnh không khớp định dạng.");
   String relative="company-logos/"+companyId+"/"+UUID.randomUUID()+"."+ext;
   Path target=root.resolve(relative).normalize();
   if(!target.startsWith(root))throw new CustomException(400,"Đường dẫn logo không hợp lệ.");
   Files.createDirectories(target.getParent());Files.write(target,bytes,StandardOpenOption.CREATE_NEW);
   return "/uploads/"+relative;
  }catch(IOException e){throw new CustomException(500,"Không thể lưu logo. Vui lòng thử lại.");}
 }
}
