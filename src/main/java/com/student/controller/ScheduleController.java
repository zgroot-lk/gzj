package com.student.controller;

import com.student.common.Result;
import com.student.dto.ScheduleDTO;
import com.student.entity.Class;
import com.student.entity.Schedule;
import com.student.repository.ClassRepository;
import com.student.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public Result<List<ScheduleDTO>> getAll(
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer dayOfWeek) {
        List<Schedule> list = scheduleService.findAll(classId, semester, academicYear, dayOfWeek);
        java.util.Set<Integer> classIds = list.stream().map(Schedule::getClassId).collect(java.util.stream.Collectors.toSet());
        java.util.Map<Integer, Class> classMap = classRepository.findAllById(classIds).stream()
                .collect(java.util.stream.Collectors.toMap(Class::getId, java.util.function.Function.identity(), (a, b) -> a));

        List<ScheduleDTO> result = list.stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();
            dto.setId(s.getId());
            dto.setClass_id(s.getClassId());
            dto.setCourse_name(s.getCourseName());
            dto.setTeacher_name(s.getTeacherName());
            dto.setDay_of_week(s.getDayOfWeek());
            dto.setStart_time(s.getStartTime());
            dto.setEnd_time(s.getEndTime());
            dto.setClassroom(s.getClassroom());
            dto.setSemester(s.getSemester());
            dto.setAcademic_year(s.getAcademicYear());
            dto.setCreated_at(s.getCreatedAt());
            dto.setUpdated_at(s.getUpdatedAt());

            Class c = classMap.get(s.getClassId());
            if (c != null) {
                dto.setClass_name(c.getClassName());
                dto.setGrade(c.getGrade());
                dto.setDepartment(c.getDepartment());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return Result.success(result);
    }

    @PostMapping
    public Result<Schedule> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            Schedule schedule = convertToSchedule(data);
            return Result.success(scheduleService.save(schedule));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Schedule> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            Schedule schedule = convertToSchedule(data);
            schedule.setId(id);
            return Result.success(scheduleService.update(schedule));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    private Schedule convertToSchedule(java.util.Map<String, Object> data) {
        Schedule schedule = new Schedule();
        
        if (data.containsKey("class_id")) {
            Object obj = data.get("class_id");
            if (obj instanceof Integer) {
                schedule.setClassId((Integer) obj);
            } else if (obj instanceof String) {
                schedule.setClassId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("course_name")) {
            schedule.setCourseName((String) data.get("course_name"));
        }
        if (data.containsKey("teacher_name")) {
            schedule.setTeacherName((String) data.get("teacher_name"));
        }
        if (data.containsKey("day_of_week")) {
            Object obj = data.get("day_of_week");
            if (obj instanceof Integer) {
                schedule.setDayOfWeek((Integer) obj);
            } else if (obj instanceof String) {
                schedule.setDayOfWeek(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("start_time") && data.get("start_time") != null) {
            String timeStr = (String) data.get("start_time");
            schedule.setStartTime(java.time.LocalTime.parse(timeStr));
        }
        if (data.containsKey("end_time") && data.get("end_time") != null) {
            String timeStr = (String) data.get("end_time");
            schedule.setEndTime(java.time.LocalTime.parse(timeStr));
        }
        if (data.containsKey("classroom")) {
            schedule.setClassroom((String) data.get("classroom"));
        }
        if (data.containsKey("semester")) {
            schedule.setSemester((String) data.get("semester"));
        }
        if (data.containsKey("academic_year")) {
            schedule.setAcademicYear((String) data.get("academic_year"));
        }
        
        return schedule;
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        scheduleService.deleteById(id);
        return Result.success(null);
    }
}


