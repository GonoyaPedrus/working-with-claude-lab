package com.marlowefinch.ops;

import java.time.Clock;
import java.time.LocalDate;

/**
 * A closed date range for the query endpoints.
 *
 * Both bounds default to "the last 30 days ending today". The record itself accepts any
 * pair of dates; request input is checked in {@link #resolve} via {@link QueryParams}
 * (TODO-232), which throws {@link InvalidRequestException} on bad input.
 */
public record DateRange(LocalDate from, LocalDate to) {

    public static final int DEFAULT_DAYS = 30;

    public static DateRange resolve(String from, String to, Clock clock) {
        QueryParams params = new QueryParams();
        DateRange range = params.range(from, to, clock);
        params.check();
        return range;
    }
}
