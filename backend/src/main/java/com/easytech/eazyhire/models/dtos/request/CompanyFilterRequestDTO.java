package com.easytech.eazyhire.models.dtos.request;

import com.easytech.eazyhire.core.PaginationRequest;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyFilterRequestDTO extends PaginationRequest {
    private CompanyStatus status;
}
