package com.teamdung.service;

import Utils.Enum.Role;
import ch.qos.logback.core.util.StringUtil;
import com.teamdung.DTO.Req.ShopReq;
import com.teamdung.DTO.Res.CategoryDTO;
import com.teamdung.entity.*;
import com.teamdung.exception.AlreadyExistsException;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.repository.*;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.nio.file.AccessDeniedException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CategoryService {

    @Autowired
    private CategoryRepo categoryRepository;

    @Autowired
    private ShopRepo shopRepo;

    @Autowired
    UserRepo userRepo;
    @Autowired
    OwnerRepo ownerRepo;
    @Autowired
    EmployeeRepo employeeRepo;

    @Autowired
    LoginService loginService;



    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại"));
    }

    public Optional<Category> getByIdOp(Long id) {
        return categoryRepository.findById(id);
    }


    public Set<Category> getListByToken(String token) {
        Owner owner = ownerRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token khng hợp lệ"));
        return owner.getCategorySet();
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {

        User user = loginService.getAccountLogin();

        Category category = new Category();
        category.setName(categoryDTO.getCategoryName().trim());
        category.setOwner(user.getOwner());
        category.setNoteUrl(categoryDTO.getNoteUrl());
        category.setFolderId(categoryDTO.getFolderId());
        category = categoryRepository.save(category);

        BeanUtils.copyProperties(category, categoryDTO);

        return categoryDTO;
    }

    @Transactional
    public void addShopIntoCategoryWithOwner(Shop shop, Category category, Owner owner) throws AccessDeniedException {
        Long owerId = owner.getId();
        if(!Objects.equals(owerId, category.getOwner().getId())
                || !Objects.equals(owerId, shop.getOwner().getId())) {
            throw new AccessDeniedException("Bạn không có quyền!");
        }
        addShopIntoCategory(shop, category);
    }

    @Transactional
    protected void addShopIntoCategory(Shop shop, Category category) {
        if (!category.getShopSet().contains(shop)) {
            category.getShopSet().add(shop);
            shop.getCategorySet().add(category);

            categoryRepository.save(category);
            shopRepo.save(shop); // Lưu shop để đảm bảo đồng bộ dữ liệu
        }
    }

    @Transactional
    public void updateShopsInCategory(Long categoryId, List<Long> shopIds) {
        // Validate đầu vào
        if (shopIds == null) {
            throw new IllegalArgumentException("Danh sách shop không được null");
        }

        // Lấy thông tin user đang đăng nhập
        User currentUser = loginService.getAccountLogin();
        if (currentUser == null) {
            throw new RuntimeException("User not logged in");
        }

        // Kiểm tra role phải là OWNER
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can update shops in categories");
        }

        // Lấy Owner từ User
        Owner owner = currentUser.getOwner();
        if (owner == null) {
            throw new RuntimeException("Owner not found for current user");
        }

        // Tìm Category theo categoryId
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Kiểm tra quyền sở hữu Category
        if (!category.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You do not have permission to update this category");
        }

        // Lấy tất cả Shop theo shopIds một lần duy nhất
        List<Shop> newShops = shopIds.isEmpty() ? List.of() : shopRepo.findAllById(shopIds);
        if (!shopIds.isEmpty() && newShops.size() != shopIds.size()) {
            throw new ResourceNotFoundException("One or more shops not found");
        }

        // Kiểm tra quyền sở hữu của tất cả Shop
        boolean hasPermission = newShops.stream()
                .allMatch(shop -> shop.getOwner().getId().equals(owner.getId()));
        if (!newShops.isEmpty() && !hasPermission) {
            throw new RuntimeException("You do not have permission to add one or more shops");
        }

        // Danh sách shop mới dưới dạng Set để so sánh
        Set<Shop> newShopSet = new HashSet<>(newShops);
        Set<Shop> currentShopSet = category.getShopSet();

        // Xóa các shop không còn trong danh sách mới
        Set<Shop> shopsToRemove = currentShopSet.stream()
                .filter(shop -> !newShopSet.contains(shop))
                .collect(Collectors.toSet());
        if (!shopsToRemove.isEmpty()) {
            shopsToRemove.forEach(shop -> {
                shop.getCategorySet().remove(category);
                currentShopSet.remove(shop);
            });
            shopRepo.saveAll(shopsToRemove); // Cập nhật các shop bị xóa
            log.info("Removed {} shops from category ID: {}", shopsToRemove.size(), categoryId);
        }

        // Thêm các shop mới chưa có trong danh sách hiện tại
        List<Shop> shopsToAdd = newShops.stream()
                .filter(shop -> !currentShopSet.contains(shop))
                .toList();
        if (!shopsToAdd.isEmpty()) {
            shopsToAdd.forEach(shop -> {
                currentShopSet.add(shop);
                shop.getCategorySet().add(category);
            });
            log.info("Added {} shops to category ID: {}", shopsToAdd.size(), categoryId);
        }

        // Lưu Category một lần duy nhất
        if (!shopsToRemove.isEmpty() || !shopsToAdd.isEmpty()) {
            categoryRepository.save(category);
            log.info("Updated category ID: {} with new shop list", categoryId);
        } else {
            log.info("No changes made to shop list for category ID: {}", categoryId);
        }
    }




    public Set<Category> getListOfCategory() {
        User user = loginService.getAccountLogin();

        // TreeSet với Comparator theo ngày tạo giảm dần
        Comparator<Category> byCreatedDateDesc = Comparator
                .comparing(Category::getCreatedAt, Comparator.reverseOrder())
                .thenComparing(Category::getId); // Tiêu chí phụ để tránh mất dữ liệu khi createdDate trùng
        TreeSet<Category> sortedSet = new TreeSet<>(byCreatedDateDesc);

        if (user.getRole().equals(Role.OWNER.toString())) {
            sortedSet.addAll(user.getOwner().getCategorySet());
        } else if (user.getRole().equals(Role.EMPLOYEE.toString())) {
            sortedSet.add(user.getEmployee().getCategory());
        } else {
            sortedSet.addAll(categoryRepository.findAll());
        }

        return sortedSet;
    }

    @Transactional
    public void deleteCategory(Long categoryId) throws AccessDeniedException {
        User user = loginService.getAccountLogin();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại"));

        // Kiểm tra quyền sở hữu
        if (user.getRole().equals(Role.OWNER.toString())) {
            if (!Objects.equals(user.getOwner().getId(), category.getOwner().getId())) {
                throw new AccessDeniedException("Bạn không có quyền xóa category này!");
            }
        } else if (user.getRole().equals(Role.EMPLOYEE.toString())) {
            throw new AccessDeniedException("Nhân viên không có quyền xóa category!");
        }
        List<Employee> employees = new ArrayList<>();

        category.getEmployeeSet().forEach(item ->{
            item.setCategory(null);
            employees.add(item);
        });

        // Xóa liên kết với các shop trước khi xóa category
        Set<Shop> shops = category.getShopSet();
        if (!shops.isEmpty()) {
            for (Shop shop : shops) {
                shop.getCategorySet().remove(category);
            }
            shopRepo.saveAll(shops);
        }
        employeeRepo.saveAll(employees);
        // Xóa category
        categoryRepository.delete(category);
        log.info("Đã xóa category với ID: {}", categoryId);
    }

    @Transactional
    public CategoryDTO updateCategoryName(Long categoryId,CategoryDTO categoryDTO) throws AccessDeniedException {
        User user = loginService.getAccountLogin();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category không tồn tại"));

        // Kiểm tra quyền sở hữu
        if (user.getRole().equals(Role.OWNER.toString())) {
            if (!Objects.equals(user.getOwner().getId(), category.getOwner().getId())) {
                throw new AccessDeniedException("Bạn không có quyền chỉnh sửa category này!");
            }
        } else if (user.getRole().equals(Role.EMPLOYEE.toString())) {
            throw new AccessDeniedException("Nhân viên không có quyền chỉnh sửa category!");
        }

        // Kiểm tra tên mới
        if (categoryDTO.getCategoryName() == null || categoryDTO.getCategoryName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên category không được để trống!");
        }

        // Cập nhật tên mới
        category.setName(categoryDTO.getCategoryName().trim());
        if(StringUtil.isNullOrEmpty(categoryDTO.getNoteUrl())) {
            category.setNoteUrl(null);
        }else{
            category.setNoteUrl(categoryDTO.getNoteUrl().trim());
        }
        if(StringUtil.isNullOrEmpty(categoryDTO.getFolderId())) {
            category.setFolderId(null);
        }else{
            category.setFolderId(categoryDTO.getFolderId().trim());
        }
        category = categoryRepository.save(category);

        // Tạo DTO trả về
        CategoryDTO categoryDTORes = new CategoryDTO();
        BeanUtils.copyProperties(category, categoryDTO);
        return categoryDTORes;
    }

    @Transactional
    public void updateEmployeeCategory(Long categoryId, List<Long> employeeIds) {
        // Lấy thông tin user đang đăng nhập
        User currentUser = loginService.getAccountLogin();
        if (currentUser == null) {
            throw new RuntimeException("User not logged in");
        }

        // Kiểm tra role phải là OWNER
        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can update employee categories");
        }

        // Lấy Owner từ User
        Owner owner = currentUser.getOwner();
        if (owner == null) {
            throw new RuntimeException("Owner not found for current user");
        }

        // Tìm danh mục theo categoryId
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        // Kiểm tra quyền: category có thuộc về owner này không
        if (!category.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You do not have permission to update this category");
        }

        // Tìm tất cả nhân viên theo employeeIds
        List<User> userList = userRepo.findAllById(employeeIds);

        // Kiểm tra xem có nhân viên nào không tìm thấy không
        if (userList.size() != employeeIds.size()) {
            throw new RuntimeException("One or more employees not found");
        }
        List<Employee> employees = new ArrayList<>();

        category.getEmployeeSet().forEach(item ->{
            item.setCategory(null);
            employees.add(item);
        });

        // Gán danh mục cho từng nhân viên
        for (User user :  userList) {
            user.getEmployee().setCategory(category);
            employees.add(user.getEmployee());
        }

        // Lưu tất cả thay đổi
        employeeRepo.saveAll(employees);
    }

    @Transactional
    public void changeAutoGetLable(Long categoryId, Boolean status) {
        User currentUser = loginService.getAccountLogin();
        if (currentUser == null) {
            throw new RuntimeException("User not logged in");
        }

        if (!currentUser.getRole().equals(Role.OWNER.toString())) {
            throw new RuntimeException("Only owners can update employee categories");
        }

        Owner owner = currentUser.getOwner();
        if (owner == null) {
            throw new RuntimeException("Owner not found for current user");
        }


        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        if (!category.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You do not have permission to update this category");
        }
        if(StringUtil.isNullOrEmpty(category.getFolderId())) {
            throw new RuntimeException("Bạn cần add folderId trước!");
        }

        category.setAutoGetLabel(status);
        categoryRepository.save(category);
    }

}
