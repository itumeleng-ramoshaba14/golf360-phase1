package com.metamorph.golf360.teetime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TeeTimeRepository extends JpaRepository<TeeTime, UUID> {

    @Query("""
            select t
            from TeeTime t
            join fetch t.course c
            where c.id = :courseId
            order by t.slotTime asc
            """)
    List<TeeTime> findByCourseIdOrderBySlotTimeAsc(@Param("courseId") UUID courseId);
}