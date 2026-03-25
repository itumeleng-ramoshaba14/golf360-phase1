package com.metamorph.golf360.course;

import com.metamorph.golf360.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String city;
    private String province;
    private String country;
    private String description;
    private String imageUrl;

    @Column(nullable = false)
    private Integer holes;
}