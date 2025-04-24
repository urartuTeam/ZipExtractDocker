<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\EmployeeProjectRepository")
 */
class EmployeeProject
{
    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="App\Entity\Employee")
     * @ORM\JoinColumn(name="employee_id", referencedColumnName="employee_id")
     */
    private Employees $employee;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="App\Entity\Project")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="project_id")
     */
    private Projects $project;

    /**
     * @ORM\Column(type="string", length=100)
     */
    private string $role;

    // Добавь остальные геттеры и сеттеры
}
