package com.unis.security;

import com.unis.user.User;
import com.unis.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String clean = identifier != null ? identifier.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(clean)
                .or(() -> userRepository.findByUsernameIgnoreCase(clean))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + identifier));

        return new CustomUserDetails(user);
    }
}
