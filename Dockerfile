FROM php:8.3-apache

# Enable mod_rewrite for Apache
RUN a2enmod rewrite

# Copy all application files to Apache root
COPY . /var/www/html/

# Set working directory permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
