package com.student.controller;

import com.student.common.Result;
import com.student.dto.StudentRecordDTO;
import com.student.entity.Class;
import com.student.entity.Student;
import com.student.entity.StudentRecord;
import com.student.repository.ClassRepository;
import com.student.repository.StudentRepository;
import com.student.service.StudentRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/records")
public class RecordController {
    @Autowired
    private StudentRecordService recordService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping
    public Result<List<StudentRecordDTO>> getAll(
            @RequestParam(required = false) Integer studentId,
            @RequestParam(required = false) String recordStatus) {
        List<StudentRecord> list = recordService.findAll(studentId, recordStatus);

        java.util.Set<Integer> studentIds = list.stream().map(StudentRecord::getStudentId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Integer, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(java.util.stream.Collectors.toMap(Student::getId, java.util.function.Function.identity(),
                        (a, b) -> a));
        java.util.Set<Integer> classIds = studentMap.values().stream().map(Student::getClassId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Integer, Class> classMap = classRepository.findAllById(classIds).stream()
                .collect(java.util.stream.Collectors.toMap(Class::getId, java.util.function.Function.identity(),
                        (a, b) -> a));

        List<StudentRecordDTO> result = list.stream().map(r -> {
            StudentRecordDTO dto = new StudentRecordDTO();
            dto.setId(r.getId());
            dto.setStudent_id(r.getStudentId());
            dto.setId_card(r.getIdCard());
            dto.setNationality(r.getNationality());
            dto.setEthnicity(r.getEthnicity());
            dto.setPolitical_status(r.getPoliticalStatus());
            dto.setHealth_status(r.getHealthStatus());
            dto.setGuardian_name(r.getGuardianName());
            dto.setGuardian_phone(r.getGuardianPhone());
            dto.setPrevious_school(r.getPreviousSchool());
            dto.setRecord_status(r.getRecordStatus() != null ? r.getRecordStatus().name() : null);
            dto.setCreated_at(r.getCreatedAt());
            dto.setUpdated_at(r.getUpdatedAt());

            Student s = studentMap.get(r.getStudentId());
            if (s != null) {
                dto.setStudent_name(s.getName());
                dto.setStudent_no(s.getStudentNo());
                Class c = classMap.get(s.getClassId());
                if (c != null) {
                    dto.setClass_name(c.getClassName());
                    dto.setGrade(c.getGrade());
                }
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<StudentRecordDTO> getById(@PathVariable Integer id) {
        StudentRecord r = recordService.findById(id);
        Student s = studentRepository.findById(r.getStudentId()).orElse(null);
        Class c = null;
        if (s != null) {
            c = classRepository.findById(s.getClassId()).orElse(null);
        }

        StudentRecordDTO dto = new StudentRecordDTO();
        dto.setId(r.getId());
        dto.setStudent_id(r.getStudentId());
        dto.setId_card(r.getIdCard());
        dto.setNationality(r.getNationality());
        dto.setEthnicity(r.getEthnicity());
        dto.setPolitical_status(r.getPoliticalStatus());
        dto.setHealth_status(r.getHealthStatus());
        dto.setGuardian_name(r.getGuardianName());
        dto.setGuardian_phone(r.getGuardianPhone());
        dto.setPrevious_school(r.getPreviousSchool());
        dto.setRecord_status(r.getRecordStatus() != null ? r.getRecordStatus().name() : null);
        dto.setCreated_at(r.getCreatedAt());
        dto.setUpdated_at(r.getUpdatedAt());
        if (s != null) {
            dto.setStudent_name(s.getName());
            dto.setStudent_no(s.getStudentNo());
        }
        if (c != null) {
            dto.setClass_name(c.getClassName());
            dto.setGrade(c.getGrade());
        }

        return Result.success(dto);
    }

    @GetMapping("/student/{studentId}")
    public Result<StudentRecordDTO> getByStudentId(@PathVariable Integer studentId) {
        StudentRecord r = recordService.findByStudentId(studentId);
        if (r == null) {
            return Result.success(null);
        }
        Student s = studentRepository.findById(r.getStudentId()).orElse(null);
        Class c = null;
        if (s != null) {
            c = classRepository.findById(s.getClassId()).orElse(null);
        }

        StudentRecordDTO dto = new StudentRecordDTO();
        dto.setId(r.getId());
        dto.setStudent_id(r.getStudentId());
        dto.setId_card(r.getIdCard());
        dto.setNationality(r.getNationality());
        dto.setEthnicity(r.getEthnicity());
        dto.setPolitical_status(r.getPoliticalStatus());
        dto.setHealth_status(r.getHealthStatus());
        dto.setGuardian_name(r.getGuardianName());
        dto.setGuardian_phone(r.getGuardianPhone());
        dto.setPrevious_school(r.getPreviousSchool());
        dto.setRecord_status(r.getRecordStatus() != null ? r.getRecordStatus().name() : null);
        dto.setCreated_at(r.getCreatedAt());
        dto.setUpdated_at(r.getUpdatedAt());
        if (s != null) {
            dto.setStudent_name(s.getName());
            dto.setStudent_no(s.getStudentNo());
        }
        if (c != null) {
            dto.setClass_name(c.getClassName());
            dto.setGrade(c.getGrade());
        }

        return Result.success(dto);
    }

    @PostMapping
    public Result<StudentRecord> create(@RequestBody java.util.Map<String, Object> data) {
        try {
            StudentRecord record = convertToStudentRecord(data);
            return Result.success(recordService.save(record));
        } catch (Exception e) {
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<StudentRecord> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> data) {
        try {
            StudentRecord record = convertToStudentRecord(data);
            record.setId(id);
            return Result.success(recordService.update(record));
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    private StudentRecord convertToStudentRecord(java.util.Map<String, Object> data) {
        StudentRecord record = new StudentRecord();
        
        if (data.containsKey("student_id")) {
            Object obj = data.get("student_id");
            if (obj instanceof Integer) {
                record.setStudentId((Integer) obj);
            } else if (obj instanceof String) {
                record.setStudentId(Integer.parseInt((String) obj));
            }
        }
        if (data.containsKey("id_card")) {
            record.setIdCard((String) data.get("id_card"));
        }
        if (data.containsKey("nationality")) {
            record.setNationality((String) data.get("nationality"));
        }
        if (data.containsKey("ethnicity")) {
            record.setEthnicity((String) data.get("ethnicity"));
        }
        if (data.containsKey("political_status")) {
            record.setPoliticalStatus((String) data.get("political_status"));
        }
        if (data.containsKey("health_status")) {
            record.setHealthStatus((String) data.get("health_status"));
        }
        if (data.containsKey("guardian_name")) {
            record.setGuardianName((String) data.get("guardian_name"));
        }
        if (data.containsKey("guardian_phone")) {
            record.setGuardianPhone((String) data.get("guardian_phone"));
        }
        if (data.containsKey("previous_school")) {
            record.setPreviousSchool((String) data.get("previous_school"));
        }
        if (data.containsKey("record_status")) {
            String statusStr = (String) data.get("record_status");
            if ("正常".equals(statusStr)) {
                record.setRecordStatus(StudentRecord.RecordStatus.正常);
            } else if ("转学".equals(statusStr)) {
                record.setRecordStatus(StudentRecord.RecordStatus.转学);
            } else if ("休学".equals(statusStr)) {
                record.setRecordStatus(StudentRecord.RecordStatus.休学);
            } else if ("退学".equals(statusStr)) {
                record.setRecordStatus(StudentRecord.RecordStatus.退学);
            }
        }
        
        return record;
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Integer id) {
        recordService.deleteById(id);
        return Result.success(null);
    }
}
