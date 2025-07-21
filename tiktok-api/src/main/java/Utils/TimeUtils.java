package Utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class TimeUtils {

    public static long getTimestampNow() {
        return Instant.now().getEpochSecond();
    }

    public static long getTimestampOneMonthOneDayAgo() {
        return Instant.now()
                .minus(1, ChronoUnit.MONTHS)
                .minus(1, ChronoUnit.DAYS)
                .getEpochSecond();
    }
}
