<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    private ?string $spotId = null;

    #[ORM\Column(length: 20)]
    private ?string $plate = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $startTime = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $endTime = null;

    #[ORM\Column(length: 50)]
    private ?string $paymentMethod = null;

    #[ORM\Column]
    private ?float $total = null;

    public function getId(): ?int { return $this->id; }
    public function getSpotId(): ?string { return $this->spotId; }
    public function setSpotId(string $spotId): self { $this->spotId = $spotId; return $this; }
    public function getPlate(): ?string { return $this->plate; }
    public function setPlate(string $plate): self { $this->plate = $plate; return $this; }
    public function getStartTime(): ?\DateTimeImmutable { return $this->startTime; }
    public function setStartTime(\DateTimeImmutable $startTime): self { $this->startTime = $startTime; return $this; }
    public function getEndTime(): ?\DateTimeImmutable { return $this->endTime; }
    public function setEndTime(\DateTimeImmutable $endTime): self { $this->endTime = $endTime; return $this; }
    public function getPaymentMethod(): ?string { return $this->paymentMethod; }
    public function setPaymentMethod(string $paymentMethod): self { $this->paymentMethod = $paymentMethod; return $this; }
    public function getTotal(): ?float { return $this->total; }
    public function setTotal(float $total): self { $this->total = $total; return $this; }
}