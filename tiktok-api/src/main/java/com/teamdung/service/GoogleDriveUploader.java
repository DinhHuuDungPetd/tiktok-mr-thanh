package com.teamdung.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.core.io.ClassPathResource;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

public class GoogleDriveUploader {
    private static final String APPLICATION_NAME = "MyApp";
    private static final String CREDENTIALS_FILE_PATH = "cjf.json";

    public static Drive getDriveService() throws IOException {
        try (InputStream credentialsStream = new ClassPathResource(CREDENTIALS_FILE_PATH).getInputStream() ) {
            GoogleCredential credential = GoogleCredential.fromStream(credentialsStream)
                    .createScoped(Collections.singleton(DriveScopes.DRIVE));
            return new Drive.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    com.google.api.client.json.gson.GsonFactory.getDefaultInstance(),
                    (HttpRequestInitializer) credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();
        }
    }

    public static String uploadFileFromUrl(String fileUrl, String fileName, String folderId) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(fileUrl);
            try (CloseableHttpResponse response = httpClient.execute(request);
                 InputStream inputStream = response.getEntity().getContent()) {

                Drive driveService = getDriveService();
                File fileMetadata = new File();
                fileMetadata.setName(generateFileName() + fileName + ".pdf");
                fileMetadata.setParents(Collections.singletonList(folderId));

                InputStreamContent mediaContent = new InputStreamContent("application/octet-stream", inputStream);
                try {
                    File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
                            .setFields("id, webViewLink")
                            .execute();
                    return uploadedFile.getWebViewLink();
                }catch (RuntimeException e){
                    return fileUrl;
                }
            }
        } catch (IOException e) {
            System.err.println("Lỗi khi tải lên Google Drive: " + e.getMessage());
            e.printStackTrace();
            return fileUrl;
        }
    }

    public static String generateFileName() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd_HH-mm-ss");
        return now.format(formatter) + "_Shipping label_";
    }
}