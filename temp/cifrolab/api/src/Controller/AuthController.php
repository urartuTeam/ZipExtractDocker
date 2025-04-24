<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;

class AuthController
{
    private PasswordHasherInterface $passwordHasher;
    private Security $security;
    private EntityManagerInterface $entityManager;

    public function __construct(PasswordHasherInterface $passwordHasher, Security $security, EntityManagerInterface $entityManager)
    {
        $this->passwordHasher = $passwordHasher;
        $this->security = $security;
        $this->entityManager = $entityManager;
    }

    #[Route('/api/login11', name: 'api_login11', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['username']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Username and password are required.'], 400);
        }

        $username = $data['username'];
        $password = $data['password'];

        // Получаем пользователя из базы данных
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            return new JsonResponse(['error' => 'Invalid credentials.'], 401);
        }

        // Проверяем пароль
        if (!$this->passwordHasher->verify($user->getPassword(), $password)) {
            return new JsonResponse(['error' => 'Invalid credentials.'], 401);
        }

        // Пример генерации токена
        $token = 'example-jwt-token';

        return new JsonResponse(['token' => $token]);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Логика выхода
        $this->security->logout();

        return new JsonResponse(['message' => 'Logged out successfully.']);
    }
}