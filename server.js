const mysql = require('mysql2');
const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');
const figlet = require('figlet');
const validate = require('./javascript/validate');

require('dotenv').config();

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'employees'
});

const app = express();

// Database Connect and Starter Title
connection.connect((error) => {
  if (error) throw error;
  console.log(chalk.yellow.bold(`====================================================================================`));
  console.log(``);
  console.log(chalk.greenBright.bold(figlet.textSync('Employee Tracker')));
  console.log(``);
  console.log(`                                                          ` + chalk.greenBright.bold('Created By: Andy Lin'));
  console.log(``);
  console.log(chalk.yellow.bold(`====================================================================================`));
  promptUser();
});

// Prompt User for Choices
const promptUser = () => {
  inquirer.prompt([
    {
      name: 'choices',
      type: 'list',
      message: 'Please select an option:',
      choices: [
        'View All Employees',
        'View All Roles',
        'View All Departments',
        'View All Employees By Department',
        'View Department Budgets',
        'Update Employee Role',
        'Update Employee Manager',
        'Add Employee',
        'Add Role',
        'Add Department',
        'Remove Employee',
        'Remove Role',
        'Remove Department',
        'Exit'
      ]
    }
  ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === 'View All Employees') {
        viewAllEmployees();
      }

      if (choices === 'View All Departments') {
        viewAllDepartments();
      }

      if (choices === 'View All Employees By Department') {
        viewEmployeesByDepartment();
      }

      if (choices === 'Add Employee') {
        addEmployee();
      }

      if (choices === 'Remove Employee') {
        removeEmployee();
      }

      if (choices === 'Update Employee Role') {
        updateEmployeeRole();
      }

      if (choices === 'Update Employee Manager') {
        updateEmployeeManager();
      }

      if (choices === 'View All Roles') {
        viewAllRoles();
      }

      if (choices === 'Add Role') {
        addRole();
      }

      if (choices === 'Remove Role') {
        removeRole();
      }

      if (choices === 'Add Department') {
        addDepartment();
      }

      if (choices === 'View Department Budgets') {
        viewDepartmentBudget();
      }

      if (choices === 'Remove Department') {
        removeDepartment();
      }

      if (choices === 'Exit') {
        connection.end();
      }
    });
};

// ----------------------------------------------------- VIEW -----------------------------------------------------------------------

// View All Employees
const viewAllEmployees = () => {
  let sql = `SELECT employee.id,
                    employee.first_name,
                    employee.last_name,
                    role.title,
                    department.department_name AS department,
                    role.salary
              FROM employee
              JOIN role ON role.id = employee.role_id
              JOIN department ON department.id = role.department_id
              ORDER BY employee.id ASC`;

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const employees = rows.map((row) => ({
        'Employee ID': row.id,
        'First Name': row.first_name,
        'Last Name': row.last_name,
        'Role': row.title,
        'Department': row.department,
        'Salary': row.salary,
      }));

      console.log(chalk.yellow.bold(`====================================================================================`));
      console.log(`                              ` + chalk.green.bold(`Current Employees:`));
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.table(employees);
      console.log(chalk.yellow.bold(`====================================================================================`));
      promptUser();
    })
    .catch((error) => {
      console.error(`Error fetching employees: ${error}`);
      promptUser();
    });
};


// View all Roles
const viewAllRoles = () => {
  const sql = `SELECT role.id, role.title, department.department_name AS department
              FROM role
              INNER JOIN department ON role.department_id = department.id`;

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const roles = rows.map((row) => ({
        'Role ID': row.id,
        'Title': row.title,
        'Department': row.department,
      }));

      console.log(chalk.yellow.bold(`====================================================================================`));
      console.log(`                              ` + chalk.green.bold(`Current Employee Roles:`));
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.table(roles);
      console.log(chalk.yellow.bold(`====================================================================================`));
      promptUser();
    })
    .catch((error) => {
      console.error(`Error fetching roles: ${error}`);
      promptUser();
    });
};



// View all Departments
const viewAllDepartments = () => {
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;

  connection.promise()
    .query(sql)
    .then(([response]) => {
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.log(`                              ` + chalk.green.bold(`All Departments:`));
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.table(response);
      console.log(chalk.yellow.bold(`====================================================================================`));
      promptUser();
    })
    .catch((error) => {
      throw error;
    });
};


// View all Employees by Department
const viewEmployeesByDepartment = () => {
  const sql =     `SELECT employee.first_name, 
                  employee.last_name, 
                  department.department_name AS department
                  FROM employee 
                  LEFT JOIN role ON employee.role_id = role.id 
                  LEFT JOIN department ON role.department_id = department.id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.log(`                              ` + chalk.green.bold(`Employees by Department:`));
      console.log(chalk.yellow.bold(`====================================================================================`));
      console.table(response);
      console.log(chalk.yellow.bold(`====================================================================================`));
      promptUser();
    });
};

//View all Departments by Budget
const viewDepartmentBudget = () => {
  console.log(chalk.yellow.bold(`====================================================================================`));
  console.log(`                              ` + chalk.green.bold(`Budget By Department:`));
  console.log(chalk.yellow.bold(`====================================================================================`));
  const sql =     `SELECT department_id AS id, 
                  department.department_name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.table(response);
      console.log(chalk.yellow.bold(`====================================================================================`));
      promptUser();
  });
};

// --------------------------------------------------- ADD --------------------------------------------------------------------

// Add a New Employee
const addEmployee = () => {
  inquirer.prompt([
    {
      name: 'first_name',
      type: 'input',
      message: "What is the employee's first name?",
      validate: validate.validateString
    },
    {
      name: 'last_name',
      type: 'input',
      message: "What is the employee's last name?",
      validate: validate.validateString
    },
    {
      name: 'role_id',
      type: 'input',
      message: "What is the employee's role ID?",
      validate: validate.validateNumber
    },
    {
      name: 'manager_id',
      type: 'input',
      message: "What is the employee's manager ID?",
      validate: validate.validateNumber
    }
  ])
    .then((answers) => {
      const { first_name, last_name, role_id, manager_id } = answers;

      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;
      const values = [first_name, last_name, role_id, manager_id];

      connection.query(sql, values, (error, response) => {
        if (error) throw error;
        console.log('Employee added successfully!\n');
        viewAllEmployees();
      });
    });
};

// Add a New Role
const addRole = () => {
  const sql = 'SELECT * FROM department';
  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const deptNamesArray = rows.map((row) => row.department_name);
      deptNamesArray.push('Create Department');

      inquirer
        .prompt([
          {
            name: 'departmentName',
            type: 'list',
            message: 'Which department is this new role in?',
            choices: deptNamesArray,
          },
        ])
        .then((answer) => {
          if (answer.departmentName === 'Create Department') {
            addDepartment();
          } else {
            addRoleResume(answer, rows); // Pass the department data as an argument
          }
        });
    })
    .catch((error) => {
      console.error(`Error fetching department data: ${error}`);
      promptUser();
    });
};

const addRoleResume = (departmentData, departments) => {
  inquirer
    .prompt([
      {
        name: 'newRole',
        type: 'input',
        message: 'What is the name of your new role?',
        validate: validate.validateString,
      },
      {
        name: 'salary',
        type: 'input',
        message: 'What is the salary of this new role?',
        validate: validate.validateSalary,
      },
    ])
    .then((answer) => {
      const createdRole = answer.newRole;
      const departmentId = departmentData.departmentName === 'Create Department'
        ? null
        : departments.find((row) => row.department_name === departmentData.departmentName).id;

      const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
      const values = [createdRole, answer.salary, departmentId];

      connection.promise()
        .query(sql, values)
        .then(() => {
          console.log(chalk.greenBright(`Role successfully created!`));
          viewAllRoles();
        })
        .catch((error) => {
          console.error(`Error creating new role: ${error}`);
          promptUser();
        });
    });
};



// Add a New Department
const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql =     `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(``);
          console.log(chalk.greenBright(answer.newDepartment + ` Department successfully created!`));
          console.log(``);
          viewAllDepartments();
        });
      });
};

// ------------------------------------------------- UPDATE -------------------------------------------------------------------------

// Update an Employee's Role
const updateEmployeeRole = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
             FROM employee
             JOIN role ON role.id = employee.role_id`;

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const employeeNamesArray = rows.map((row) => `${row.first_name} ${row.last_name}`);
      const rolesArray = rows.map((row) => row.role_id);

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new role?',
            choices: employeeNamesArray,
          },
          {
            name: 'chosenRole',
            type: 'list',
            message: 'What is their new role?',
            choices: rolesArray,
          },
        ])
        .then((answers) => {
          const { chosenEmployee, chosenRole } = answers;
          const employeeId = rows.find((row) => `${row.first_name} ${row.last_name}` === chosenEmployee).id;

          let sql = 'UPDATE employee SET role_id = ? WHERE id = ?';

          connection.promise()
            .query(sql, [chosenRole, employeeId])
            .then(() => {
              console.log(chalk.greenBright.bold(`====================================================================================`));
              console.log(chalk.greenBright(`Employee Role Updated`));
              console.log(chalk.greenBright.bold(`====================================================================================`));
              promptUser();
            })
            .catch((error) => {
              console.error(`Error updating employee role: ${error}`);
              promptUser();
            });
        });
    })
    .catch((error) => {
      console.error(`Error fetching employee and role data: ${error}`);
      promptUser();
    });
};


// Update an Employee's Manager
const updateEmployeeManager = () => {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
             FROM employee`;

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const employeeNamesArray = rows.map((row) => `${row.first_name} ${row.last_name}`);

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new manager?',
            choices: employeeNamesArray,
          },
          {
            name: 'newManager',
            type: 'list',
            message: 'Who is their manager?',
            choices: employeeNamesArray,
          },
        ])
        .then((answers) => {
          const { chosenEmployee, newManager } = answers;
          const employeeId = rows.find((row) => `${row.first_name} ${row.last_name}` === chosenEmployee).id;
          const managerId = rows.find((row) => `${row.first_name} ${row.last_name}` === newManager).id;

          if (employeeId === managerId) {
            console.log(chalk.redBright.bold(`====================================================================================`));
            console.log(chalk.redBright(`Invalid Manager Selection: Employee cannot be their own manager`));
            console.log(chalk.redBright.bold(`====================================================================================`));
            promptUser();
          } else {
            let sql = 'UPDATE employee SET manager_id = ? WHERE id = ?';

            connection.promise()
              .query(sql, [managerId, employeeId])
              .then(() => {
                console.log(chalk.greenBright.bold(`====================================================================================`));
                console.log(chalk.greenBright(`Employee Manager Updated`));
                console.log(chalk.greenBright.bold(`====================================================================================`));
                promptUser();
              })
              .catch((error) => {
                console.error(`Error updating employee manager: ${error}`);
                promptUser();
              });
          }
        });
    })
    .catch((error) => {
      console.error(`Error fetching employee data: ${error}`);
      promptUser();
    });
};


// -------------------------------------- REMOVE --------------------------------------------------------

// Delete an Employee
const removeEmployee = () => {
  const sql = 'SELECT employee.id, employee.first_name, employee.last_name FROM employee';

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const employeeNamesArray = rows.map((employee) => `${employee.first_name} ${employee.last_name}`);

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employeeNamesArray,
          },
        ])
        .then((answer) => {
          const chosenEmployeeName = answer.chosenEmployee;
          const employeeId = rows.find((employee) => `${employee.first_name} ${employee.last_name}` === chosenEmployeeName).id;

          const deleteSql = 'DELETE FROM employee WHERE id = ?';
          connection.promise()
            .query(deleteSql, [employeeId])
            .then(() => {
              console.log(chalk.redBright(`Employee Successfully Removed`));
              viewAllEmployees();
            })
            .catch((error) => {
              console.error(`Error deleting employee: ${error}`);
              promptUser();
            });
        });
    })
    .catch((error) => {
      console.error(`Error fetching employee data: ${error}`);
      promptUser();
    });
};


// Delete a Role
const removeRole = () => {
  const sql = 'SELECT role.id, role.title FROM role';

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const roleNamesArray = rows.map((role) => role.title);

      inquirer
        .prompt([
          {
            name: 'chosenRole',
            type: 'list',
            message: 'Which role would you like to remove?',
            choices: roleNamesArray,
          },
        ])
        .then((answer) => {
          const chosenRoleTitle = answer.chosenRole;
          const roleId = rows.find((role) => role.title === chosenRoleTitle).id;

          const deleteSql = 'DELETE FROM role WHERE id = ?';
          connection.promise()
            .query(deleteSql, [roleId])
            .then(() => {
              console.log(chalk.redBright('Role Successfully Removed'));
              viewAllRoles();
            })
            .catch((error) => {
              console.error(`Error deleting role: ${error}`);
              promptUser();
            });
        });
    })
    .catch((error) => {
      console.error(`Error fetching role data: ${error}`);
      promptUser();
    });
};


// Delete a Department
const removeDepartment = () => {
  const sql = 'SELECT department.id, department.department_name FROM department';

  connection.promise()
    .query(sql)
    .then(([rows]) => {
      const departmentNamesArray = rows.map((department) => department.department_name);

      inquirer
        .prompt([
          {
            name: 'chosenDept',
            type: 'list',
            message: 'Which department would you like to remove?',
            choices: departmentNamesArray,
          },
        ])
        .then((answer) => {
          const chosenDepartmentName = answer.chosenDept;
          const departmentId = rows.find((department) => department.department_name === chosenDepartmentName).id;

          const deleteSql = 'DELETE FROM department WHERE id = ?';
          connection.promise()
            .query(deleteSql, [departmentId])
            .then(() => {
              console.log(chalk.redBright('Department Successfully Removed'));
              viewAllDepartments();
            })
            .catch((error) => {
              console.error(`Error deleting department: ${error}`);
              promptUser();
            });
        });
    })
    .catch((error) => {
      console.error(`Error fetching department data: ${error}`);
      promptUser();
    });
};



// Starts the server to begin listening
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});