package EazyTech.EazyHire.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/** Saves a job and its complete, ordered pipeline as one transaction. */
@Data
public class SaveJobPipelineRequestDTO {
    @NotNull
    @Valid
    private UpdateJobRequestDTO job;

    @NotNull
    @Valid
    private List<PipelineRoundRequestDTO> rounds;
}
