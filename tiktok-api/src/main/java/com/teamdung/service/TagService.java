package com.teamdung.service;

import Utils.Enum.Role;
import com.teamdung.entity.*;
import com.teamdung.repository.CategoryRepo;
import com.teamdung.repository.ShopRepo;
import com.teamdung.repository.TagRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagService {

    @Autowired
    TagRepo tagRepo;

    @Autowired
    LoginService loginService;

    @Autowired
    ShopRepo shopRepo;

    @Autowired
    CategoryRepo categoryRepo;


    public Set<Tag> getTags() {
        User current = loginService.getAccountLogin();
        return current.getTagSet();
    }


    public void updateTags(Long tagId, String tagName) {
        User currentUser = loginService.getAccountLogin();
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag không tồn tại"));
        if(!currentUser.getRole().equals(Role.ADMIN.toString())) {
            if(!currentUser.getTagSet().contains(tag)) {
                throw new RuntimeException("Bạn chưa được quản lý tag!");
            }
        }
        tag.setName(tagName);
        tagRepo.save(tag);

    }

    @Transactional
    public Tag createTag(String tagName, List<Long> categoryIds) {
        User currentUser = loginService.getAccountLogin();
        Tag tag = new Tag();
        tag.setName(tagName);

        if (currentUser.getRole().equals(Role.EMPLOYEE.toString())) {
            Employee employee = currentUser.getEmployee();
            Category employeeCategory = employee.getCategory();

            if (employeeCategory == null) {
                throw new RuntimeException("Bạn chưa được quản lý danh mục!");
            }

            tag.setOwner(employee.getOwner());
            tag.setCategorySet(Set.of(employeeCategory));
            // Cập nhật phía Category (owning side)
            employeeCategory.getTagSet().add(tag);
        } else if (currentUser.getRole().equals(Role.OWNER.toString())) {
            tag.setOwner(currentUser.getOwner());
            if (categoryIds != null && !categoryIds.isEmpty()) {
                Set<Category> categories = new HashSet<>(categoryRepo.findAllById(categoryIds));
                if (categories.isEmpty()) {
                    System.out.println("Không tìm thấy category nào với categoryIds: " + categoryIds);
                } else {
                    tag.setCategorySet(categories);
                    // Cập nhật phía Category (owning side)
                    for (Category category : categories) {
                        category.getTagSet().add(tag);
                    }
                }
            }
        }

        return tagRepo.save(tag);
    }
    @Transactional
    public void deleteTag(Long tagId) {
        User currentUser = loginService.getAccountLogin();

        // Tìm Tag theo tagId
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tag với ID: " + tagId));

        // Kiểm tra quyền sở hữu
        if (currentUser.getRole().equals(Role.EMPLOYEE.toString())) {
            Employee employee = currentUser.getEmployee();
            if (!tag.getOwner().equals(employee.getOwner())) {
                throw new RuntimeException("Bạn không có quyền xóa tag này!");
            }
        } else if (currentUser.getRole().equals(Role.OWNER.toString())) {
            if (!tag.getOwner().equals(currentUser.getOwner())) {
                throw new RuntimeException("Bạn không có quyền xóa tag này!");
            }
        } else {
            throw new RuntimeException("Vai trò không hợp lệ!");
        }

        // Cập nhật phía Category (owning side) để xóa Tag khỏi tagSet
        Set<Category> categories = tag.getCategorySet();
        if (categories != null && !categories.isEmpty()) {
            for (Category category : categories) {
                category.getTagSet().remove(tag);
            }
        }

        Set<Shop> shopSet = tag.getShops();
        shopSet.forEach(shop -> {
            shop.setTag(null);
        });
        shopRepo.saveAll(shopSet);
        // Xóa Tag khỏi database
        tagRepo.delete(tag);
    }

}
