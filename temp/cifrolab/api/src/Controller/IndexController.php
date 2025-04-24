<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class IndexController extends AbstractController
{
    #[Route('/index', name: 'app_index')]
    public function index(): \Symfony\Component\HttpFoundation\Response
    {
        return $this->render('index/index.html.twig');
    }
}
