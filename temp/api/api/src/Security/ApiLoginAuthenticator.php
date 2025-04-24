<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ApiLoginAuthenticator extends AbstractAuthenticator
{
    private UserPasswordHasherInterface $passwordHasher;
    private UserProviderInterface $userProvider;

    public function __construct(UserPasswordHasherInterface $passwordHasher, UserProviderInterface $userProvider)
    {
        $this->passwordHasher = $passwordHasher;
        $this->userProvider = $userProvider;
    }

    public function supports(Request $request): ?bool
    {
        return $request->isMethod('POST') && $request->getPathInfo() === '/api/login';
    }

    public function authenticate(Request $request): Passport
    {
        $data = json_decode($request->getContent(), true);
        return new Passport(
            new UserBadge($data['username'], fn($u) => $this->userProvider->loadUserByUsername($u)),
            new PasswordCredentials($data['password'])
        );
    }

    public function onAuthenticationSuccess(Request $request, \Symfony\Component\Security\Core\Authentication\Token\TokenInterface $token, string $firewallName): ?\Symfony\Component\HttpFoundation\Response
    {
        // handled by success_handler
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?\Symfony\Component\HttpFoundation\Response
    {
        // handled by failure_handler
        return null;
    }
}