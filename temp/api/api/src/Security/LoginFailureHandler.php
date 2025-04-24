<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\Request;

class LoginFailureHandler implements AuthenticationFailureHandlerInterface
{
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): JsonResponse
    {
        // логируем полный стек
        file_put_contents(
            __DIR__.'/../../var/log/auth_trace.log',
            $exception->getTraceAsString(),
            FILE_APPEND
        );

        return new JsonResponse(['error'=>'Invalid credentials'], 401);
    }
}