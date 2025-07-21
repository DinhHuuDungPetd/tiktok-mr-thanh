package com.teamdung.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamdung.entity.Telegram;
import com.teamdung.repository.TelegramRepo;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class TelegramService {

    @Autowired
    TelegramRepo telegramRepo;

    public boolean sendMessage(String text, String botToken, String chatId) {
        String url = String.format(
                "https://little-mud-26ab.perdhd1702.workers.dev/bot%s/sendMessage?chat_id=%s&text=%s&parse_mode=HTML",
                botToken, chatId, text
        );
        log.info("Sending Telegram notification to {}", url);
        try{
            RestTemplate restTemplate = new RestTemplate();
            String responseEntity =  restTemplate.getForObject(url, String.class);
            return parseResponse(responseEntity);
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

    private Boolean parseResponse(String responseBody) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> responseMap = objectMapper.readValue(
                responseBody,
                new TypeReference<Map<String, Object>>() {}
        );
        Object okeValue = responseMap.get("ok");
        boolean code;
        if (okeValue == null) {
            code = false; // Nếu không có "oke", coi như thất bại
        } else if (okeValue instanceof Boolean) {
            code = (boolean) okeValue; // Nếu là Boolean, ép kiểu trực tiếp
        } else if (okeValue instanceof String) {
            code = Boolean.parseBoolean((String) okeValue); // Nếu là String, parse thành boolean
        } else {
            code = false; // Các trường hợp khác, mặc định thất bại
        }
        return code;
    }

    public void testService() {
        List<Telegram> telegrams = telegramRepo.findAll();
        for (Telegram telegram : telegrams) {
            sendMessage("Sorry, petd is fixing now", telegram.getToken(), telegram.getChatId());
        }

    }
}
