package com.vr.taskflow.util;

public final class ProjectKeyGenerator {

    private ProjectKeyGenerator() {}

    public static String generateKey(String projectName) {
        if (projectName == null || projectName.isBlank()) {
            return "PROJ";
        }

        String cleaned = projectName.replaceAll("[^a-zA-Z0-9 ]", "").trim().toUpperCase();
        String[] words = cleaned.split("\\s+");

        StringBuilder key = new StringBuilder();
        if (words.length == 1) {
            String word = words[0];
            key.append(word.length() <= 4 ? word : word.substring(0, 4));
        } else {
            for (String word : words) {
                if (!word.isEmpty()) {
                    key.append(word.charAt(0));
                }
                if (key.length() >= 5) break;
            }
        }

        if (key.length() < 2) {
            key.append("PRJ");
        }

        return key.toString();
    }
}

