package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.LocationOptionDTO;
import EazyTech.EazyHire.services.LocationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationServiceImpl implements LocationService {

    private final ObjectMapper objectMapper;
    private final List<LocationOptionDTO> provinces = new ArrayList<>();
    private final Map<String, List<LocationOptionDTO>> wardsByProvince = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("full_json_generated_data_vn_units.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Map<String, Object>> data = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> item : data) {
                    String provinceCode = (String) item.get("Code");
                    provinces.add(new LocationOptionDTO(provinceCode, (String) item.get("FullName")));

                    List<LocationOptionDTO> wards = new ArrayList<>();
                    List<Map<String, Object>> rawWards = objectMapper.convertValue(
                            item.getOrDefault("Wards", List.of()),
                            new TypeReference<List<Map<String, Object>>>() {}
                    );
                    for (Map<String, Object> ward : rawWards) {
                        wards.add(new LocationOptionDTO(
                                (String) ward.get("Code"),
                                (String) ward.get("FullName")
                        ));
                    }
                    wardsByProvince.put(provinceCode, wards);
                }
                log.info("Loaded {} provinces and {} wards", provinces.size(),
                        wardsByProvince.values().stream().mapToInt(List::size).sum());
            }
        } catch (Exception e) {
            log.error("Failed to load provinces from JSON", e);
        }
    }

    @Override
    public List<LocationOptionDTO> getProvinces() {
        return provinces;
    }

    @Override
    public List<LocationOptionDTO> getWards(String provinceCode) {
        if (provinceCode == null || !wardsByProvince.containsKey(provinceCode.trim())) {
            throw new CustomException(404, "Không tìm thấy tỉnh/thành phố");
        }
        return wardsByProvince.get(provinceCode.trim());
    }
}
