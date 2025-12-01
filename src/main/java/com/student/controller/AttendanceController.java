package com.student.controller;

import com.student.common.Result;
import com.student.dto.AttendanceDTO;
import com.student.entity.Attendance;
import com.student.entity.Class;
import com.student.entity.Student;
import com.student.repository.ClassRepository;
import com.student.repository.StudentRepository;
import com.student.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public Result<List<AttendanceDTO>> getAll(
            @RequestParam(required = false) Integer studentId,
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String courseName) {
        List<Attendance> list = attendanceService.findAll(studentId, classId, status, startDate, endDate, courseName);
        // 预加载学生和班级信息，避免 N+1
        java.util.Set<Integer> studentIds = list.stream().map(Attendance::getStudentId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Set<Integer> classIds = list.stream().map(Attendance::getClassId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Integer, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(java.util.stream.Collectors.toMap(Student::getId, java.util.function.Function.identity(),
                        (a, b) -> a));
        java.util.Map<Integer, Class> classMap = classRepository.findAllById(classIds).stream()
                .collect(java.util.stream.Collectors.toMap(Class::getId, java.util.function.Function.identity(),
                        (a, b) -> a));

        List<AttendanceDTO> result = list.stream().map(a -> {
            AttendanceDTO dto = new AttendanceDTO();
            dto.setId(a.getId());
            dto.setStudent_id(a.getStudentId());
            dto.setClass_id(a.getClassId());
            dto.setAttendance_date(a.getAttendanceDate());
            dto.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
            dto.setCourse_name(a.getCourseName());
            dto.setRemark(a.getRemark());
            dto.setCreated_at(a.getCreatedAt());
            dto.setUpdated_at(a.getUpdatedAt());

            Student s = studentMap.get(a.getStudentId());
            if (s != null) {
                dto.setStudent_name(s.getName());
                dto.setStudent_no(s.getStudentNo());
            }
            Class c = classMap.get(a.getClassId());
            if (c != null) {
                dto.setClass_name(c.getClassName());
                dto.setGrade(c.getGrade());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return Result.success(result);
    }

    @PostMapping
    public Result<Attendance> create(@RequestBody Attendance attendance) {
        return Result.success(attendanceService.save(attendance));
    }

    @PutMapping("/{id}")
    public Result<Attendance> update(@PathVariable Integer id, @RequestBody Attendance attendance) {
        attendance.setId(id);
        return Result.success(attendanceService.update(attendance));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        attendanceService.deleteById(id);
        return Result.success(null);
    }
}
