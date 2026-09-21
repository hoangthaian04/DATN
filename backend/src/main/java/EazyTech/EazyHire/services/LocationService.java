package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.LocationOptionDTO;

import java.util.List;

public interface LocationService {
    List<LocationOptionDTO> getProvinces();

    List<LocationOptionDTO> getWards(String provinceCode);
}
