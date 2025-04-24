<?php

namespace App\Security;

use Symfony\Component\Security\Authenticator\AuthenticatorInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Authentication\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\Authentication\Passport\UserBadge;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticator implements AuthenticatorInterface
{
    public function supports(Request $request): ?bool
    {
        // Проверяем, есть ли заголовок Authorization
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request)
    {
        // Получаем токен из заголовка Authorization
        $authorizationHeader = $request->headers->get('Authorization');
        if (strpos($authorizationHeader, 'Bearer ') === false) {
            throw new AuthenticationException('Token not found');
        }

        $token = str_replace('Bearer ', '', $authorizationHeader);
        // Дополнительно можно декодировать токен (например, с использованием библиотеки JWT)

        // Возвращаем пользователя по токену (например, можно декодировать JWT)
        return new SelfValidatingPassport(new UserBadge('username'));  // Замените на правильного пользователя
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new Response('Authentication failed', Response::HTTP_FORBIDDEN);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;  // Успешная аутентификация
    }
}