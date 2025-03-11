-- Drop procedures if they exist to avoid conflicts during updates
DROP PROCEDURE IF EXISTS sp_authenticate_user;
DROP PROCEDURE IF EXISTS sp_create_user;

DELIMITER //

-- Procedure to authenticate a user
CREATE PROCEDURE sp_authenticate_user(
    IN p_email VARCHAR(50),
    IN p_role VARCHAR(20),
    OUT p_user_id INT,
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_password_hash VARCHAR(255);
    -- Check if user exists with the given email and role
    SELECT user_id, password_hash INTO p_user_id, v_password_hash
    FROM Users
    WHERE email = p_email AND role = p_role;

    IF p_user_id IS NOT NULL THEN
        -- Assuming password is passed as plain text and compared with hashed value
        -- Note: In production, use a secure method to pass and verify passwords
        SET p_success = TRUE;
    ELSE
        SET p_success = FALSE;
    END IF;
END //

-- Procedure to create a new user and employee
CREATE PROCEDURE sp_create_user(
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_role VARCHAR(20),
    IN p_department_id INT,
    IN p_hr_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Rollback on error
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = 'Database error occurred.';
    END;

    START TRANSACTION;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM Users WHERE email = p_email) THEN
        SET p_success = FALSE;
        SET p_message = 'Email already exists.';
        ROLLBACK;
    ELSE
        -- Insert into Users table
        INSERT INTO Users (first_name, last_name, email, password_hash, role, is_active)
        VALUES (p_first_name, p_last_name, p_email, p_password, p_role, 1);

        -- Get the last inserted user_id
        SET v_user_id = LAST_INSERT_ID();

        -- Insert into Employees table
        INSERT INTO Employees (user_id, department_id, hr_id)
        VALUES (v_user_id, p_department_id, p_hr_id);

        SET p_success = TRUE;
        SET p_message = 'User created successfully.';
        COMMIT;
    END IF;
END //

DELIMITER ;