package Utils;

import com.teamdung.DTO.Res.NoteOrder;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class GoogleSheetsAppScript {

    private static final String WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz8Q1YnYdhySk7qbWEP_3yCHsc2RUQMpbYvNon0FyhliD5di8q-cMIqICi7s8hb-zr5/exec";

    public static void sendToGoogleSheets(NoteOrder noteOrder) throws Exception {

        // Gửi HTTP POST request đến Web App
        URL url = new URL(WEB_APP_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = noteOrder.toString().getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        // Đọc phản hồi từ server
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            System.out.println("Data successfully written to Google Sheets");
        } else {
            System.out.println("Failed to write data. Response code: " + responseCode);
        }
    }
}
