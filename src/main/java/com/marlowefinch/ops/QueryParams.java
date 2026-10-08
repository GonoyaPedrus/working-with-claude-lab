package com.marlowefinch.ops;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses and checks the query parameters shared by the /api endpoints (TODO-232).
 * Every problem is collected; {@link #check()} throws once with all of them.
 */
final class QueryParams {

    static final int MAX_SPAN_DAYS = 366;
    static final int MIN_LIMIT = 1;
    static final int MAX_LIMIT = 500;

    private final List<String> errors = new ArrayList<>();

    /** Missing bounds default to the last {@link DateRange#DEFAULT_DAYS} days ending today. */
    DateRange range(String from, String to, Clock clock) {
        LocalDate today = LocalDate.now(clock);
        LocalDate start = parseDate("from", from, today.minusDays(DateRange.DEFAULT_DAYS));
        LocalDate end = parseDate("to", to, today);
        if (start == null || end == null) {
            return null;
        }
        if (start.isAfter(end)) {
            errors.add("from must be on or before to");
        } else if (ChronoUnit.DAYS.between(start, end) + 1 > MAX_SPAN_DAYS) {
            errors.add("range must span at most " + MAX_SPAN_DAYS + " days");
        }
        return new DateRange(start, end);
    }

    int limit(String raw, int defaultLimit) {
        if (raw == null || raw.isBlank()) {
            return defaultLimit;
        }
        try {
            int value = Integer.parseInt(raw.trim());
            if (value >= MIN_LIMIT && value <= MAX_LIMIT) {
                return value;
            }
        } catch (NumberFormatException e) {
            // fall through to the shared message
        }
        errors.add("limit must be an integer between " + MIN_LIMIT + " and " + MAX_LIMIT);
        return defaultLimit;
    }

    void check() {
        if (!errors.isEmpty()) {
            throw new InvalidRequestException(errors);
        }
    }

    private LocalDate parseDate(String name, String raw, LocalDate fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        try {
            return LocalDate.parse(raw.trim());
        } catch (DateTimeParseException e) {
            errors.add(name + " must be an ISO date (YYYY-MM-DD)");
            return null;
        }
    }
}
