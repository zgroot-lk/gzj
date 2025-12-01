package com.student.repository;

import com.student.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByClassId(Integer classId);
    List<Schedule> findBySemester(String semester);
    List<Schedule> findByAcademicYear(String academicYear);
    List<Schedule> findByDayOfWeek(Integer dayOfWeek);
}


