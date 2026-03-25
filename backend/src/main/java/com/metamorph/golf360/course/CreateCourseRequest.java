package com.metamorph.golf360.course;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCourseRequest {

    @NotBlank
    private String name;

    private String city;
    private String province;
    private String country;
    private String description;
    private String imageUrl;

    @NotNull
    @Min(1)
    @Max(36)
    private Integer holes;
}