package com.easytech.eazyhire.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class AuthorizedUser {

    protected Long id;
    protected String name;
    protected String email;
    protected Long companyId;
    protected String companyStatus;
    protected List<String> roles;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles != null && !roles.isEmpty()) {
            return roles.stream().map(SimpleGrantedAuthority::new).toList();
        }
        return Collections.emptyList();
    }
}
