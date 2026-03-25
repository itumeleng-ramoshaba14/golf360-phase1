package com.metamorph.golf360.course;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public class CourseDtos {
    @Data
    @Builder
    public static class CourseResponse {
        private UUID id;
        private UUID clubId;
        private String name;
        private int holes;
        private int parValue;
        private String difficulty;
    }
}

