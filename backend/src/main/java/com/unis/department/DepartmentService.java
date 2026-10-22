package com.unis.department;

import com.unis.common.BadRequestException;
import com.unis.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments(boolean onlyActive) {
        List<Department> list = onlyActive ? departmentRepository.findByActiveTrue() : departmentRepository.findAll();
        return list.stream().map(DepartmentDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return DepartmentDto.fromEntity(dept);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department with code '" + dto.getCode() + "' already exists");
        }
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department with name '" + dto.getName() + "' already exists");
        }

        Department dept = new Department();
        dept.setName(dto.getName().trim());
        dept.setCode(dto.getCode().trim().toUpperCase());
        dept.setDescription(dto.getDescription());
        dept.setContactEmail(dto.getContactEmail());
        dept.setActive(dto.isActive());

        return DepartmentDto.fromEntity(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (!dept.getCode().equalsIgnoreCase(dto.getCode()) && departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department with code '" + dto.getCode() + "' already exists");
        }
        if (!dept.getName().equalsIgnoreCase(dto.getName()) && departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department with name '" + dto.getName() + "' already exists");
        }

        dept.setName(dto.getName().trim());
        dept.setCode(dto.getCode().trim().toUpperCase());
        dept.setDescription(dto.getDescription());
        dept.setContactEmail(dto.getContactEmail());
        dept.setActive(dto.isActive());

        return DepartmentDto.fromEntity(departmentRepository.save(dept));
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        dept.setActive(active);
        departmentRepository.save(dept);
    }
}
