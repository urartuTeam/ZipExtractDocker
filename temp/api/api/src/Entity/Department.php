<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\DepartmentRepository")
 */
class Department
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private int $department_id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private ?int $parent_department_id;

    public function getDepartmentId(): int
    {
        return $this->department_id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getParentDepartmentId(): ?int
    {
        return $this->parent_department_id;
    }

}
