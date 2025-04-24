<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\LeaveRepository")
 */
class Leave
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private int $leave_id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Employee")
     * @ORM\JoinColumn(name="employee_id", referencedColumnName="employee_id")
     */
    private Employees $employee;

    /**
     * @ORM\Column(type="date")
     */
    private \DateTimeInterface $start_date;

    /**
     * @ORM\Column(type="date", nullable=true)
     */
    private ?\DateTimeInterface $end_date;

    /**
     * @ORM\Column(type="string", length=50)
     */
    private string $type;

    // Добавь остальные геттеры и сеттеры
}
