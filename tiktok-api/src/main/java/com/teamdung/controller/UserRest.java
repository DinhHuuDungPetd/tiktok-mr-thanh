package com.teamdung.controller;

import Utils.Enum.Role;
import com.teamdung.DTO.Req.UserReq;
import com.teamdung.DTO.Req.UserUpdateReq;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.DTO.Res.User.UserResponseDTO;
import com.teamdung.exception.AlreadyExistsException;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.service.LoginService;
import com.teamdung.service.UserSevice;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth/user")
public class UserRest {

    @Autowired
    UserSevice userSevice;

    @Autowired
    LoginService loginService;

    @GetMapping("/auth")
    public ResponseEntity<?> getAuth(){
        try {
            return ApiResponse.success("Thành công", userSevice.getAuth());
        }catch (Exception e){
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @GetMapping("/get-user-login")
    public ResponseEntity<?> getUserLogin(){
        try {
            return ApiResponse.success("Thành công", UserResponseDTO.convertToDTO(loginService.getAccountLogin()));
        }catch (Exception e){
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/update-user/{email}")
    public ResponseEntity<?> updateUser(@PathVariable("email") String email, @RequestBody UserUpdateReq userUpdateReq){
        try {
            userSevice.updateUser(email, userUpdateReq);
            return ApiResponse.success("Update thành công", null);
        }catch (Exception e){
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }


    @PostMapping("/create-owner")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserReq userDTO, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ApiResponse.error("Dữ liệu không hợp lệ", errors, HttpStatus.BAD_REQUEST);
        }
        try {
            return ApiResponse.success("Tạo owner thành công", userSevice.createUser(userDTO, Role.OWNER));
        }catch (AlreadyExistsException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create-employee")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody UserReq userDTO, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ApiResponse.error("Dữ liệu không hợp lệ", errors, HttpStatus.BAD_REQUEST);
        }
        try {
            return ApiResponse.success("Tạo owner thành công", userSevice.createUser(userDTO, Role.EMPLOYEE));
        }catch (AlreadyExistsException e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(),Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-employee-of-owner")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<UserResponseDTO> employees = userSevice.getAllEmployeesOfOwner();
            return ApiResponse.success("Lấy nhân viên thành công", employees);
        } catch (RuntimeException e) {
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            userSevice.deleteEmployee(id);
            return ApiResponse.success("Lấy nhân viên thành công", null);
        }catch (ResourceNotFoundException e) {
            return ApiResponse.error("Dữ liệu không hợp lệ",Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
        catch (RuntimeException e) {
            return ApiResponse.error("Dữ liệu không hợp lệ",Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateReq userUpdateReq,
            BindingResult result) {
        if (result.hasErrors()) {
            return ApiResponse.error("Dữ liệu không hợp lệ", Map.of("error", "Tên khng hợp lệ"), HttpStatus.BAD_REQUEST);
        }
        try {
            userSevice.updateEmployee(id, userUpdateReq);
            return ApiResponse.success("Update user", null);
        } catch (RuntimeException e) {
            return  ApiResponse.error("Dữ liệu không hợp lệ",Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e) {
            return  ApiResponse.error("Lỗi hệ thống",Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
