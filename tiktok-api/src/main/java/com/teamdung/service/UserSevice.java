package com.teamdung.service;

import Utils.Enum.Role;
import ch.qos.logback.core.util.StringUtil;
import com.teamdung.DTO.Req.UserReq;
import com.teamdung.DTO.Req.UserUpdateReq;
import com.teamdung.DTO.Res.Auth;
import com.teamdung.DTO.Res.User.UserResponseDTO;
import com.teamdung.entity.Employee;
import com.teamdung.entity.Owner;
import com.teamdung.entity.ShopAuth;
import com.teamdung.entity.User;
import com.teamdung.exception.AlreadyExistsException;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.repository.EmployeeRepo;
import com.teamdung.repository.OwnerRepo;
import com.teamdung.repository.ShopAuthRepo;
import com.teamdung.repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserSevice {

    @Autowired
    private OwnerRepo ownerRepo;
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private EmployeeRepo employeeRepo;
    @Autowired
    PasswordEncoderService passwordEncoderService;

    @Autowired
    LoginService loginService;
    @Autowired
    ShopAuthRepo shopAuthRepo;

    public Owner findByToken(String token) {
        return ownerRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Not found owner"));
    }

    @Transactional
    public UserResponseDTO createUser(UserReq userReq, Role role) {

        Optional<User> userOp = userRepo.findByEmail(userReq.getEmail().trim());
        userOp.ifPresent(user ->{
            throw new AlreadyExistsException("User already exists");
        });

        User user = new User();
        user.setEmail(userReq.getEmail().trim());
        user.setName(userReq.getName());
        user.setPassword(passwordEncoderService.encodedPassword(userReq.getPassword()));
        user.setRole(role.toString());
        if(role == Role.OWNER) {
            Owner owner = new Owner();
            owner.setUniqueId(UUID.randomUUID().toString());
            owner.setUser(user);
            user.setOwner(owner);
            ownerRepo.save(owner);
        }
        if(role == Role.EMPLOYEE) {
            User currentUser = loginService.getAccountLogin();
            if (!currentUser.getRole().equals(Role.OWNER.toString())) {
                throw new RuntimeException("Only owners can retrieve employee list");
            }
            Employee employee = new Employee();
            user.setEmployee(employee);
            employee.setUser(user);
            employee.setOwner(currentUser.getOwner());
            employeeRepo.save(employee);

        }
        return UserResponseDTO.convertToDTO(user) ;
    }

    public List<UserResponseDTO> getAllEmployeesOfOwner() {
        // Lấy thông tin owner hiện tại từ token
        User currentUser = loginService.getAccountLogin();
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can retrieve employee list");
        }

        Owner owner = currentUser.getOwner();
        if (owner == null) {
            throw new RuntimeException("Owner not found for current user");
        }

        // Lấy danh sách nhân viên và sắp xếp theo createdAt giảm dần
        return owner.getEmployeeSet().stream()
                .map(Employee::getUser) // Lấy User từ Employee
                .sorted(Comparator.comparing(User::getCreatedAt).reversed()) // Sắp xếp giảm dần theo createdAt
                .map(UserResponseDTO::convertToDTO) // Chuyển thành DTO
                .collect(Collectors.toList()); // Thu thập thành List
    }

    @Transactional
    public void deleteEmployee(Long id) {
        // Validate đầu vào
        if (id == null) {
            throw new IllegalArgumentException("ID nhân viên không được null");
        }

        // Lấy thông tin user đang đăng nhập
        User currentUser = loginService.getAccountLogin();

        // Kiểm tra role phải là OWNER
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can delete employees");
        }

        // Lấy Owner từ User
        Owner owner = currentUser.getOwner();
        if (owner == null) {
            throw new RuntimeException("Owner not found for current user");
        }
        System.out.println(owner.getId());

        // Tìm nhân viên theo ID
        Employee employee = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy employee!"))
                .getEmployee();
        if (!employee.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You do not have permission to delete this employee");
        }

        // Xóa nhân viên
        employeeRepo.delete(employee);
    }

    @Transactional
    public void updateEmployee(Long id, UserUpdateReq userUpdateReq ){
        User currentUser = loginService.getAccountLogin();
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can update employees");
        }
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
        if(!Objects.equals(user.getEmployee().getOwner().getId(), currentUser.getOwner().getId())){
            throw new RuntimeException("User not belong to this employee");
        }
        updateUser(user, userUpdateReq);
    }

    @Transactional
    public void updateUser(String email, UserUpdateReq userUpdateReq ){
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Not found user"));

        User currentUser = loginService.getAccountLogin();

        if(!user.getEmail().equals(currentUser.getEmail())){
            throw new RuntimeException("User not accuser");
        }
        if(!passwordEncoderService.matches(userUpdateReq.getPassword(),user.getPassword())){
            throw new RuntimeException("Wrong old password");
        }

        user.setName(userUpdateReq.getName());
        if(user.getRole().equals(Role.OWNER.toString())){
            Owner owner = user.getOwner();
            owner.setTeamName(userUpdateReq.getTeamName());
            ownerRepo.save(owner);
        }
        if(!StringUtil.isNullOrEmpty(userUpdateReq.getNewPassword())){
            user.setPassword(passwordEncoderService.encodedPassword(userUpdateReq.getNewPassword()));
        }
        userRepo.save(user);
    }




    @Transactional
    protected void updateUser(User user, UserUpdateReq userUpdateReq) {
        // Cập nhật tên
        user.setName(userUpdateReq.getName());

        // Xử lý password
        String newPassword = userUpdateReq.getPassword();
        if (StringUtils.hasText(newPassword)) { // Kiểm tra password không null và không rỗng
            if (newPassword.trim().length() < 8) {
                throw new RuntimeException("Password phải từ 8 ký tự trở lên");
            }
            user.setPassword(passwordEncoderService.encodedPassword(newPassword.trim()));
        } // Nếu null hoặc rỗng, giữ nguyên password cũ, không cần xử lý

        // Lưu thay đổi
        userRepo.save(user);
    }

    public Auth getAuth() {
        User currentUser = loginService.getAccountLogin();
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can retrieve auth");
        }
        List<ShopAuth> shopAuthList = shopAuthRepo.findAll();

        Auth auth = new Auth();
        auth.setAuthToken(currentUser.getOwner().getUniqueId());
        for (ShopAuth shopAuth : shopAuthList) {
            auth.setUrlAuth(shopAuth.getLinkAuth());
        }
        return auth;
    }



}
