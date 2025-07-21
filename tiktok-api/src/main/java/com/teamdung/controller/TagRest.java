package com.teamdung.controller;

import com.teamdung.DTO.Req.TagDTO;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.DTO.Res.CategoryDTO;
import com.teamdung.exception.AlreadyExistsException;
import com.teamdung.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/tag")
public class TagRest {

    @Autowired
    TagService tagService;

    @PostMapping
    public ResponseEntity<?> createTag(
            @Valid @RequestBody TagDTO tagDTO,
            BindingResult result
    ) {

        if (result.hasErrors()) {
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", "Tag name  trống!"), HttpStatus.BAD_REQUEST);
        }
        try {
            return ApiResponse.success("Tạo tag thành công", tagService.createTag(tagDTO.getName(), tagDTO.getCategoryId()));
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getListTag() {
        try {
            return ApiResponse.success("Tạo tag thành công", tagService.getTags());
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable Long id){
        try {
            tagService.deleteTag(id);
            return ApiResponse.success("Xóa tag thành công", null);
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTag(@PathVariable Long id, @RequestBody Map<String, String> tagNameMap){

        try {
            String tagName = tagNameMap.get("tagName");
            tagService.updateTags(id,tagName );
            return ApiResponse.success("Update tag thành công", null);
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
