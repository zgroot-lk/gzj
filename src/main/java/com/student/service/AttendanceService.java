package com.student.service;

import com.student.entity.Attendance;
import com.student.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<Attendance> findAll(Integer studentId, Integer classId, String status,
                                   LocalDate startDate, LocalDate endDate, String courseName) {
        List<Attendance> attendances = attendanceRepository.findAll();
        
        return attendances.stream()
                .filter(a -> studentId == null || a.getStudentId().equals(studentId))
                .filter(a -> classId == null || a.getClassId().equals(classId))
                .filter(a -> status == null || a.getStatus().name().equals(status))
                .filter(a -> startDate == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || !a.getAttendanceDate().isAfter(endDate))
                .filter(a -> courseName == null || (a.getCourseName() != null && a.getCourseName().contains(courseName)))
                .collect(Collectors.toList());
    }

    @Transactional
    public Attendance save(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance update(Attendance attendance) {
        Attendance existing = attendanceRepository.findById(attendance.getId())
                .orElseThrow(() -> new RuntimeException("考勤记录不存在"));
        if (attendance.getAttendanceDate() != null) existing.setAttendanceDate(attendance.getAttendanceDate());
        if (attendance.getStatus() != null) existing.setStatus(attendance.getStatus());
        if (attendance.getCourseName() != null) existing.setCourseName(attendance.getCourseName());
        if (attendance.getRemark() != null) existing.setRemark(attendance.getRemark());
        return attendanceRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        attendanceRepository.deleteById(id);
    }
}


