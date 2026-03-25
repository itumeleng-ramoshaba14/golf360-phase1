package com.metamorph.golf360.config;

import com.metamorph.golf360.course.Course;
import com.metamorph.golf360.course.CourseRepository;
import com.metamorph.golf360.teetime.TeeTime;
import com.metamorph.golf360.teetime.TeeTimeRepository;
import com.metamorph.golf360.teetime.TeeTimeStatus;
import com.metamorph.golf360.user.User;
import com.metamorph.golf360.user.UserRepository;
import com.metamorph.golf360.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final TeeTimeRepository teeTimeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (courseRepository.count() > 0) {
            return;
        }

        Course championship = new Course();
        championship.setName("Johannesburg Championship Course");
        championship.setCity("Johannesburg");
        championship.setProvince("Gauteng");
        championship.setCountry("South Africa");
        championship.setDescription("Premium championship golf course with tournament-ready fairways.");
        championship.setHoles(18);
        championship.setImageUrl(
                "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1400&auto=format&fit=crop");
        championship = courseRepository.save(championship);

        Course executive = new Course();
        executive.setName("Pretoria Executive Course");
        executive.setCity("Pretoria");
        executive.setProvince("Gauteng");
        executive.setCountry("South Africa");
        executive.setDescription("Accessible executive course suited for social and business rounds.");
        executive.setHoles(9);
        executive.setImageUrl(
                "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?q=80&w=1400&auto=format&fit=crop");
        executive = courseRepository.save(executive);

        createTeeTime(championship, LocalDateTime.now().plusDays(1).withHour(7).withMinute(0), 4, "450.00");
        createTeeTime(championship, LocalDateTime.now().plusDays(1).withHour(9).withMinute(0), 4, "520.00");
        createTeeTime(championship, LocalDateTime.now().plusDays(2).withHour(8).withMinute(30), 4, "480.00");

        createTeeTime(executive, LocalDateTime.now().plusDays(1).withHour(10).withMinute(0), 4, "300.00");
        createTeeTime(executive, LocalDateTime.now().plusDays(2).withHour(11).withMinute(0), 4, "320.00");

        if (!userRepository.existsByEmail("admin@golf360.com")) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@golf360.com");
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("player@golf360.com")) {
            User player = new User();
            player.setFullName("Demo Player");
            player.setEmail("player@golf360.com");
            player.setPassword(passwordEncoder.encode("Player123!"));
            player.setRole(UserRole.PLAYER);
            userRepository.save(player);
        }
    }

    private void createTeeTime(Course course, LocalDateTime slotTime, int maxPlayers, String price) {
        TeeTime teeTime = new TeeTime();
        teeTime.setCourse(course);
        teeTime.setSlotTime(slotTime);
        teeTime.setMaxPlayers(maxPlayers);
        teeTime.setBookedPlayers(0);
        teeTime.setPrice(new BigDecimal(price));
        teeTime.setStatus(TeeTimeStatus.AVAILABLE);
        teeTimeRepository.save(teeTime);
    }
}