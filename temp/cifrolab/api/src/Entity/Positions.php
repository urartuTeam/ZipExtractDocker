<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PositionRepository")
 */
class Positions
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private int $position_id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private ?int $department_id;

    /**
     * @ORM\Column(type="integer")
     */
    private int $staff_units;

    /**
     * @ORM\Column(type="integer", options={"default": 0})
     */
    private int $current_count;

    /**
     * @ORM\Column(type="integer", options={"default": 0})
     */
    private int $vacancies;

    public function getPositionId(): int
    {
        return $this->position_id;
    }

    // Добавь остальные геттеры и сеттеры
}
