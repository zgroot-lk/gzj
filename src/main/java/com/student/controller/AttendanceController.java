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
    public Result<Attendance> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Attendance attendance = convertToAttendance(data);
            return Result.success(attendanceService.save(attendance));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Attendance> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Attendance attendance = convertToAttendance(data);
            attendance.setId(id);
            return Result.success(attendanceService.update(attendance));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    private Attendance convertToAttendance(java.util.Map<String, Object> data) {
        Attendance attendance = new Attendance();
        
        if (data.containsKey("student_id")) {
            Object obj = data.get("student_id");
            if (obj instanceof Integer) {
                attendance.setStudentId((Integer) obj);
            } else if (obj instanceof String) {
                attendance.setStudentId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("class_id")) {
            Object obj = data.get("class_id");
            if (obj instanceof Integer) {
                attendance.setClassId((Integer) obj);
            } else if (obj instanceof String) {
                attendance.setClassId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("attendance_date") && data.get("attendance_date") != null) {
            String dateStr = (String) data.get("attendance_date");
            attendance.setAttendanceDate(java.time.LocalDate.parse(dateStr));
        }
        if (data.containsKey("status")) {
            String statusStr = (String) data.get("status");
            if ("出勤".equals(statusStr)) {
                attendance.setStatus(Attendance.AttendanceStatus.出勤);
            } else if ("迟到".equals(statusStr)) {
                attendance.setStatus(Attendance.AttendanceStatus.迟到);
            } else if ("早退".equals(statusStr)) {
                attendance.setStatus(Attendance.AttendanceStatus.早退);
            } else if ("缺勤".equals(statusStr)) {
                attendance.setStatus(Attendance.AttendanceStatus.缺勤);
            } else if ("请假".equals(statusStr)) {
                attendance.setStatus(Attendance.AttendanceStatus.请假);
            }
        }
        if (data.containsKey("course_name")) {
            attendance.setCourseName((String) data.get("course_name"));
        }
        if (data.containsKey("remark")) {
            attendance.setRemark((String) data.get("remark"));
        }
        
        return attendance;
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        attendanceService.deleteById(id);
        return Result.success(null);
    }
}
