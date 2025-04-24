<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\EmployeeRepository")
 */
class Employees
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private int $employee_id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $full_name;

    /**
     * @ORM\Column(type="string", length=20, nullable=true)
     */
    private ?string $phone;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $email;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private ?int $manager_id;

    public function getEmployeeId(): int
    {
        return $this->employee_id;
    }

    // Добавь остальные геттеры и сеттеры
}
