package com.teamdung.controller;

import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.DTO.Res.CategoryDTO;
import com.teamdung.exception.AlreadyExistsException;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth/category")
public class CategoryRest {

    @Autowired
    CategoryService categoryService;

    @PostMapping
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody CategoryDTO categoryDTO,
            BindingResult result
    ) {

        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ApiResponse.error("Dữ liệu không hợp lệ", errors, HttpStatus.BAD_REQUEST);
        }
        try {
            return ApiResponse.success("Tạo danh mục thành công", categoryService.createCategory(categoryDTO));
        }catch (AlreadyExistsException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-list-category")
    public ResponseEntity<?> getCategoryList() {
        try {
            return ApiResponse.success("Lấy danh mục thành công", categoryService.getListOfCategory());
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteCategory(@RequestParam(name = "category_id") Long categoryId) {
        try {
            categoryService.deleteCategory(categoryId);
            return ApiResponse.success("Xóa danh mục thành công",null);
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/name")
    public ResponseEntity<?> updateCategoryName(
            @PathVariable("id") Long categoryId,
            @RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO updatedCategory = categoryService.updateCategoryName(categoryId, categoryDTO);
            return ApiResponse.success("Cập nhật tên category thành công", updatedCategory);
        } catch (AccessDeniedException e) {
            return ApiResponse.error("Bạn không có quyền chỉnh sửa category này",
                    Map.of("error", e.getMessage()), HttpStatus.FORBIDDEN);
        } catch (ResourceNotFoundException e) {
            return ApiResponse.error("Category không tồn tại",
                    Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Tên category không hợp lệ",
                    Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ApiResponse.error("Có lỗi xảy ra khi cập nhật category",
                    Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update-employee-categories/{categoryId}/employees")
    public ResponseEntity<?> updateEmployeeCategory(
            @PathVariable Long categoryId,
            @RequestBody List<Long> employeeIds) {
        try {
            categoryService.updateEmployeeCategory(categoryId, employeeIds);
            return ApiResponse.success("Cập nhật tên category thành công", null);
        } catch (Exception e) {
            return ApiResponse.error("Có lỗi xảy ra khi cập nhật category",
                    Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/categories/{categoryId}/shops")
    public ResponseEntity<?> updateShopsInCategory(
            @PathVariable Long categoryId,
            @RequestBody List<Long> shopIds) {
        try {
            categoryService.updateShopsInCategory(categoryId, shopIds);
            return ApiResponse.success("Cập nhật tên category thành công", null);
        } catch (RuntimeException e) {
            return ApiResponse.error("Có lỗi xảy ra khi cập nhật category",
                    Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi hệ thống",
                    Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/categories/{categoryId}/change-auto-get-label")
    public ResponseEntity<?> changeAutoGetLabel(@PathVariable Long categoryId, @RequestParam Boolean status) {
        try {
            categoryService.changeAutoGetLable( categoryId, status);
            return ApiResponse.success("Thay đổi trạng thái", null);
        } catch (RuntimeException e) {
            return ApiResponse.error("Có lỗi xảy ra khi cập nhật category",
                    Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi hệ thống",
                    Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
