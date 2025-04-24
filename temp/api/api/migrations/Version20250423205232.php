<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250423205232 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            DROP SEQUENCE departments_department_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE employees_employee_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE projects_project_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE leaves_leave_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE positions_position_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE position_department_position_link_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE position_stats_stats_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE users_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE "user" (id SERIAL NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "users" (email)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON "users" (username)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE position_department DROP CONSTRAINT position_department_position_id_fkey
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE position_stats DROP CONSTRAINT position_stats_position_id_fkey
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE employees
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE departments
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE positions
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE leaves
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE users
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE position_department
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE employeeprojects
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE projects
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE position_stats
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE departments_department_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE employees_employee_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE projects_project_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE leaves_leave_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE positions_position_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE position_department_position_link_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE position_stats_stats_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE users_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE employees (employee_id SERIAL NOT NULL, full_name VARCHAR(255) NOT NULL, position_id INT DEFAULT NULL, phone VARCHAR(20) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, manager_id INT DEFAULT NULL, department_id INT DEFAULT NULL, PRIMARY KEY(employee_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE departments (department_id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, parent_department_id INT DEFAULT NULL, PRIMARY KEY(department_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE positions (position_id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(position_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE leaves (leave_id SERIAL NOT NULL, employee_id INT DEFAULT NULL, start_date DATE NOT NULL, end_date DATE DEFAULT NULL, type VARCHAR(50) DEFAULT NULL, PRIMARY KEY(leave_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE users (id SERIAL NOT NULL, username VARCHAR(255) NOT NULL, password TEXT NOT NULL, email VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, roles VARCHAR(50) NOT NULL, active BOOLEAN DEFAULT true NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX users_email_key ON users (email)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX users_username_key ON users (username)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE position_department (position_id INT NOT NULL, position_link_id SERIAL NOT NULL, department_id INT DEFAULT NULL, sort INT DEFAULT NULL)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_E3FCCD0ADD842E46 ON position_department (position_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE employeeprojects (employee_id INT NOT NULL, project_id INT NOT NULL, role VARCHAR(100) DEFAULT NULL, PRIMARY KEY(employee_id, project_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE projects (project_id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, department_id INT DEFAULT NULL, PRIMARY KEY(project_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE position_stats (stats_id SERIAL NOT NULL, position_id INT NOT NULL, staff_units INT NOT NULL, current_count INT DEFAULT 0, vacancies INT DEFAULT 0, PRIMARY KEY(stats_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX position_stats_position_id_key ON position_stats (position_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE position_department ADD CONSTRAINT position_department_position_id_fkey FOREIGN KEY (position_id) REFERENCES positions (position_id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE position_stats ADD CONSTRAINT position_stats_position_id_fkey FOREIGN KEY (position_id) REFERENCES positions (position_id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE "users"
        SQL);
    }
}
