<?php

namespace App\Controller;

use App\Entity\Spot;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    #[Route('/api/spots', name: 'api_spots_list', methods: ['GET'])]
    public function getSpots(EntityManagerInterface $entityManager): JsonResponse
    {
        $spots = $entityManager->getRepository(Spot::class)->findAll();
        $data = [];
        foreach ($spots as $spot) {
            $data[] = [
                'id' => $spot->getId(),
                'zone' => $spot->getZone(),
                'type' => $spot->getType(),
                'price' => $spot->getPrice(),
                'status' => $spot->getStatus(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/reserve', name: 'api_reserve', methods: ['POST'])]
    public function reserve(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $params = json_decode($request->getContent(), true);
        
        $reservation = new Reservation();
        $reservation->setSpotId($params['spotId']);
        $reservation->setPlate($params['plate']);
        $reservation->setStartTime(new \DateTimeImmutable($params['start']));
        $reservation->setEndTime(new \DateTimeImmutable($params['end']));
        $reservation->setPaymentMethod($params['payment']);
        $reservation->setTotal((float)$params['total']);

        $spot = $entityManager->getRepository(Spot::class)->find($params['spotId']);
        if ($spot) {
            $spot->setStatus('taken');
        }

        $entityManager->persist($reservation);
        $entityManager->flush();

        return $this->json(['status' => 'success', 'id' => $reservation->getId()]);
    }
#[Route('/api/spots/{id}/toggle', name: 'api_spots_toggle', methods: ['POST'])]
public function toggleSpot(string $id, EntityManagerInterface $entityManager): JsonResponse
{
    $spot = $entityManager->getRepository(Spot::class)->find($id);
    
    if (!$spot) {
        return $this->json(['error' => 'Not found'], 404);
    }

    $newStatus = $spot->getStatus() === 'free' ? 'taken' : 'free';
    $spot->setStatus($newStatus);
    
    $entityManager->flush();

    return $this->json(['status' => 'success', 'new_status' => $newStatus]);
}    
}