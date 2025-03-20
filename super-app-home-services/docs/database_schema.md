# Database Schema for Super App for Home Services

## ER Diagram (Simplified)

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│   Users    │       │  Services  │       │ Languages  │
├────────────┤       ├────────────┤       ├────────────┤
│ id (PK)    │       │ id (PK)    │       │ id (PK)    │
│ email      │───┐   │ provider_id│──┐    │ code       │
│ password   │   │   │ category_id│  │    │ name       │
│ user_type  │   │   │ base_price │  │    │ is_active  │
│ ...        │   │   │ ...        │  │    └────────────┘
└────────────┘   │   └────────────┘  │           │
                 │          │        │           │
                 │          │        │    ┌──────┴───────┐
┌────────────┐   │          │        │    │ Translations │
│  Profiles  │   │          ▼        │    ├──────────────┤
├────────────┤   │   ┌────────────┐  │    │ id (PK)      │
│ id (PK)    │   │   │ ServiceI18n│  │    │ language_id  │
│ user_id    │◄──┘   ├────────────┤  │    │ key          │
│ first_name │       │ id (PK)    │  │    │ value        │
│ last_name  │       │ service_id │  │    └──────────────┘
│ phone      │       │ language_id│  │
│ avatar     │       │ name       │  │
│ ...        │       │ description│  │
└────────────┘       └────────────┘  │
                                     │
┌────────────┐       ┌────────────┐  │
│ Bookings   │       │ Categories │  │
├────────────┤       ├────────────┤  │
│ id (PK)    │       │ id (PK)    │  │
│ customer_id│───┐   │ parent_id  │  │
│ service_id │   │   └────────────┘  │
│ status     │   │          │        │
│ date_time  │   │          │        │
│ ...        │   │          ▼        │
└────────────┘   │   ┌────────────┐  │
      │          │   │CategoryI18n│  │
      │          │   ├────────────┤  │
      ▼          │   │ id (PK)    │  │
┌────────────┐   │   │ category_id│  │
│Transactions│   │   │ language_id│  │
├────────────┤   │   │ name       │  │
│ id (PK)    │   │   │ description│  │
│ booking_id │   │   └────────────┘  │
│ amount     │   │                   │
│ commission │   │   ┌────────────┐  │
│ status     │   │   │  Providers │  │
│ stripe_id  │   │   ├────────────┤  │
│ ...        │   │   │ id (PK)    │  │
└────────────┘   │   │ user_id    │◄─┘
                 │   │ business_name │
                 │   │ description  │
                 │   │ rating      │
                 └──►│ ...         │
                     └────────────┘
```

## SQL DDL Scripts

```sql
-- Languages table
CREATE TABLE languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Translations table for general app text
CREATE TABLE translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    language_id INT NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    UNIQUE KEY (language_id, `key`)
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'provider', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Service provider details
CREATE TABLE providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    business_address TEXT NOT NULL,
    tax_id VARCHAR(50),
    stripe_account_id VARCHAR(255),
    avg_rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Service categories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Category translations
CREATE TABLE category_i18n (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    language_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    UNIQUE KEY (category_id, language_id)
);

-- Services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    category_id INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Service translations
CREATE TABLE service_i18n (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    language_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    UNIQUE KEY (service_id, language_id)
);

-- Provider availability
CREATE TABLE availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 6=Saturday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    service_id INT NOT NULL,
    provider_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    date_time DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    provider_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    stripe_payment_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Ratings and reviews
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    rating TINYINT NOT NULL COMMENT 'Rating from 1-5',
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Insert default languages
INSERT INTO languages (code, name) VALUES 
('hr', 'Hrvatski'),
('en', 'English'),
('sr', 'Srpski'),
('bs', 'Bosanski');

-- Set Croatian as default active language
UPDATE languages SET is_active = true WHERE code = 'hr';
```

## Multi-language Design Approach

The database schema is designed with internationalization (i18n) in mind:

1. **Languages Table**: Stores all supported languages with their codes and active status.

2. **Translations Table**: Contains general application text translations using a key-value approach.

3. **Entity-specific Translation Tables**: For content-heavy entities like services and categories, dedicated translation tables (service_i18n, category_i18n) are used to store language-specific content.

This approach allows:
- Initial MVP launch with Croatian only by setting only Croatian as active
- Easy addition of new languages without schema changes
- Efficient content translation management
- Separation of language-independent data (prices, dates) from translatable content 