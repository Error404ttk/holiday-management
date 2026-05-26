-- Replace host, password, and table name after confirming the real environment.
-- Do not use root or ALL PRIVILEGES for the application.

CREATE USER 'holiday_app'@'192.168.99.50'
IDENTIFIED BY 'StrongPasswordHere';

GRANT SELECT, INSERT, UPDATE
ON hosxp.<actual_holiday_table>
TO 'holiday_app'@'192.168.99.50';

GRANT SELECT, INSERT, UPDATE
ON hosxp_holiday_app.*
TO 'holiday_app'@'192.168.99.50';

FLUSH PRIVILEGES;

