<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ApiController
{
    #[Route('/api/data', name: 'api_data')]
    public function getData(): JsonResponse
    {
        $data = ['message' => 'Hello from Symfony API!'];

        return new JsonResponse($data);
    }
}
