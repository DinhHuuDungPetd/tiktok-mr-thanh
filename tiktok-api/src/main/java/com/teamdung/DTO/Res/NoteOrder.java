package com.teamdung.DTO.Res;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoteOrder {

    String createdAt;
    String account;
    String orderId;
    String totalPrice;
    String address;
    String urlLabel;
    String status;

    List<LineItemNote> lineItemNoteList  = new ArrayList<>();


    public String toString (){
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

    }
}
