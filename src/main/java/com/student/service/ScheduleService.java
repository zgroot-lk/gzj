package com.student.service;

import com.student.entity.Schedule;
import com.student.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    public List<Schedule> findAll(Integer classId, String semester, String academicYear, Integer dayOfWeek) {
        List<Schedule> schedules = scheduleRepository.findAll();
        
        return schedules.stream()
                .filter(s -> classId == null || s.getClassId().equals(classId))
                .filter(s -> semester == null || (s.getSemester() != null && s.getSemester().equals(semester)))
                .filter(s -> academicYear == null || (s.getAcademicYear() != null && s.getAcademicYear().equals(academicYear)))
                .filter(s -> dayOfWeek == null || s.getDayOfWeek().equals(dayOfWeek))
                .collect(Collectors.toList());
    }

    @Transactional
    public Schedule save(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule update(Schedule schedule) {
        Schedule existing = scheduleRepository.findById(schedule.getId())
                .orElseThrow(() -> new RuntimeException("课表记录不存在"));
        if (schedule.getCourseName() != null) existing.setCourseName(schedule.getCourseName());
        if (schedule.getTeacherName() != null) existing.setTeacherName(schedule.getTeacherName());
        if (schedule.getDayOfWeek() != null) existing.setDayOfWeek(schedule.getDayOfWeek());
        if (schedule.getStartTime() != null) existing.setStartTime(schedule.getStartTime());
        if (schedule.getEndTime() != null) existing.setEndTime(schedule.getEndTime());
        if (schedule.getClassroom() != null) existing.setClassroom(schedule.getClassroom());
        if (schedule.getSemester() != null) existing.setSemester(schedule.getSemester());
        if (schedule.getAcademicYear() != null) existing.setAcademicYear(schedule.getAcademicYear());
        return scheduleRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        scheduleRepository.deleteById(id);
    }
}


