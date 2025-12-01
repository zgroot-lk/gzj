package com.student.service;

import com.student.entity.StudentRecord;
import com.student.repository.StudentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentRecordService {
    @Autowired
    private StudentRecordRepository recordRepository;

    public List<StudentRecord> findAll(Integer studentId, String recordStatus) {
        List<StudentRecord> records = recordRepository.findAll();
        
        return records.stream()
                .filter(r -> studentId == null || r.getStudentId().equals(studentId))
                .filter(r -> recordStatus == null || r.getRecordStatus().name().equals(recordStatus))
                .collect(Collectors.toList());
    }

    public StudentRecord findById(Integer id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("学籍信息不存在"));
    }

    public StudentRecord findByStudentId(Integer studentId) {
        return recordRepository.findFirstByStudentId(studentId).orElse(null);
    }

    @Transactional
    public StudentRecord save(StudentRecord record) {
        if (record.getNationality() == null) {
            record.setNationality("中国");
        }
        if (record.getRecordStatus() == null) {
            record.setRecordStatus(StudentRecord.RecordStatus.正常);
        }
        return recordRepository.save(record);
    }

    @Transactional
    public StudentRecord update(StudentRecord record) {
        StudentRecord existing = findById(record.getId());
        if (record.getIdCard() != null) existing.setIdCard(record.getIdCard());
        if (record.getNationality() != null) existing.setNationality(record.getNationality());
        if (record.getEthnicity() != null) existing.setEthnicity(record.getEthnicity());
        if (record.getPoliticalStatus() != null) existing.setPoliticalStatus(record.getPoliticalStatus());
        if (record.getHealthStatus() != null) existing.setHealthStatus(record.getHealthStatus());
        if (record.getGuardianName() != null) existing.setGuardianName(record.getGuardianName());
        if (record.getGuardianPhone() != null) existing.setGuardianPhone(record.getGuardianPhone());
        if (record.getPreviousSchool() != null) existing.setPreviousSchool(record.getPreviousSchool());
        if (record.getRecordStatus() != null) existing.setRecordStatus(record.getRecordStatus());
        return recordRepository.save(existing);
    }

    @Transactional
    public void deleteById(Integer id) {
        recordRepository.deleteById(id);
    }
}


