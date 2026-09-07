package EazyTech.EazyHire.services.impl;

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
    private List<Map<String, String>> provinces = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("full_json_generated_data_vn_units.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Map<String, Object>> data = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> item : data) {
                    Map<String, String> province = new HashMap<>();
                    province.put("code", (String) item.get("Code"));
                    province.put("name", (String) item.get("FullName"));
                    provinces.add(province);
                }
                log.info("Loaded {} provinces", provinces.size());
            }
        } catch (Exception e) {
            log.error("Failed to load provinces from JSON", e);
        }
    }

    @Override
    public List<Map<String, String>> getProvinces() {
        return provinces;
    }
}
