package com.easytech.eazyhire.core.utils;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Random;
import java.util.regex.Pattern;

public class StringUtils {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String DIGITS = "0123456789";
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String random(int length) {
        Random random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(ALPHANUMERIC.length());
            sb.append(ALPHANUMERIC.charAt(randomIndex));
        }

        return sb.toString();
    }

    public static String randomOTP(int length) {
        Random random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(DIGITS.length());
            sb.append(DIGITS.charAt(randomIndex));
        }

        return sb.toString();
    }

    public static boolean isEmpty(String s) {
        if (s == null) {
            return true;
        }
        return s.isBlank() || s.isEmpty();
    }

    public static String toSlug(String input) {
        if (isEmpty(input)) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noDiacritics = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        noDiacritics = noDiacritics.replace("đ", "d").replace("Đ", "D");
        String nowhitespace = WHITESPACE.matcher(noDiacritics).replaceAll("-");
        String slug = NON_LATIN.matcher(nowhitespace).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
