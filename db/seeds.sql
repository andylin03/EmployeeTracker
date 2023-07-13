INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Finance"), ("Legal"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 80000, 1), ("Senior Engineer", 135000, 1), ("CFO", 300000, 3), ("Chief Counsel", 310000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('John', 'Random', 1, 2), ('Jim', 'Smith', 1, null), ('Ronald', 'Manning', 1, 2), ('Jimmy', 'Jones', 2, 2), ('Larry', 'Legal', 4, null);
