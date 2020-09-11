<?php declare(strict_types=1);

/*
The MIT License (MIT)

Copyright (c) 2015-2020 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
 
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Security\UserInterface;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 */
class User implements UserInterface
{

	/**
	 * @ORM\Id
	 * @ORM\GeneratedValue
	 * @ORM\Column(type="integer")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=180, unique=true)
	 */
	private $username;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $username_canonical;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $email;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $email_canonical;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $enabled;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $salt;

	/**
	 * @var string The hashed password
	 * @ORM\Column(type="string")
	 */
	private $password;

	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $last_login;

	/**
	 * @ORM\Column(type="boolean", nullable=true)
	 */
	private $locked;

	/**
	 * @ORM\Column(type="boolean", nullable=true)
	 */
	private $expired;

	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $expires_at;

	/**
	 * @ORM\Column(type="string", length=255, nullable=true)
	 */
	private $confirmation_token;

	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $password_requested_at;

	/**
	 * @ORM\Column(type="json")
	 */
	private $roles = [];

	/**
	 * @ORM\Column(type="boolean", nullable=true)
	 */
	private $credentials_expired;

	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $credentials_expire_at;

	/**
	 * Plain password. Used for model validation. Must not be persisted.
	 *
	 * @var string
	 */
	protected $plainPassword;

	/**
	 * @see UserInterface
	 */
	public function getId(): ?int
	{
		return $this->id;
	}

	/**
	 * A visual identifier that represents this user.
	 *
	 * @see UserInterface
	 */
	public function getUsername(): string
	{
		return (string) $this->username;
	}

	/**
	 * @see UserInterface
	 */
	public function setUsername(string $username): self
	{
		$this->username = $username;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getUsernameCanonical(): ?string
	{
		return $this->username_canonical;
	}

	/**
	 * @see UserInterface
	 */
	public function setUsernameCanonical(string $username_canonical): self
	{
		$this->username_canonical = $username_canonical;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getEmail(): ?string
	{
		return $this->email;
	}

	/**
	 * @see UserInterface
	 */
	public function setEmail(string $email): self
	{
		$this->email = $email;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getEmailCanonical(): ?string
	{
		return $this->email_canonical;
	}

	/**
	 * @see UserInterface
	 */
	public function setEmailCanonical(string $email_canonical): self
	{
		$this->email_canonical = $email_canonical;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getEnabled(): ?bool
	{
		return $this->enabled;
	}

	/**
	 * @see UserInterface
	 */
	public function isEnabled(): ?bool
	{
		return $this->enabled;
	}

	/**
	 * @see UserInterface
	 */
	public function setEnabled(?bool $enabled): self
	{
		$this->enabled = $enabled;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getSalt(): ?string
	{
		// not needed when using the "bcrypt" algorithm in security.yaml
		return $this->salt;
	}

	/**
	 * @see UserInterface
	 */
	public function setSalt(string $salt): self
	{
		$this->salt = $salt;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getPassword(): string
	{
		return (string) $this->password;
	}

	/**
	 * @see UserInterface
	 */
	public function setPassword(string $password): self
	{
		$this->password = $password;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getLastLogin(): ?\DateTimeInterface
	{
		return $this->last_login;
	}

	/**
	 * @see UserInterface
	 */
	public function setLastLogin(?\DateTimeInterface $last_login = null): self
	{
		$this->last_login = $last_login;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getLocked(): ?bool
	{
		return $this->locked;
	}

	/**
	 * @see UserInterface
	 */
	public function setLocked(?bool $locked): self
	{
		$this->locked = $locked;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function isLocked(): ?bool
	{
		return $this->locked;
	}

	/**
	 * @see UserInterface
	 */
	public function isAccountNonLocked(): ?bool
	{
		return ! $this->locked;
	}

	/**
	 * @see UserInterface
	 */
	public function getExpired(): ?bool
	{
		return $this->expired;
	}

	/**
	 * @see UserInterface
	 */
	public function setExpired(?bool $expired): self
	{
		$this->expired = $expired;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function isExpired(): ?bool
	{
		return $this->expired;
	}

	/**
	 * @see UserInterface
	 */
	public function isAccountNonExpired(): ?bool
	{
		return !$this->expired;
	}

	/**
	 * @see UserInterface
	 */
	public function getExpiresAt(): ?\DateTimeInterface
	{
		return $this->expires_at;
	}

	/**
	 * @see UserInterface
	 */
	public function setExpiresAt(?\DateTimeInterface $expires_at): self
	{
		$this->expires_at = $expires_at;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getConfirmationToken(): ?string
	{
		return $this->confirmation_token;
	}

	/**
	 * @see UserInterface
	 */
	public function setConfirmationToken(?string $confirmation_token): self
	{
		$this->confirmation_token = $confirmation_token;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getPasswordRequestedAt(): ?\DateTimeInterface
	{
		return $this->password_requested_at;
	}

	/**
	 * @see UserInterface
	 */
	public function setPasswordRequestedAt(?\DateTimeInterface $password_requested_at = null): self
	{
		$this->password_requested_at = $password_requested_at;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function isPasswordRequestNonExpired($ttl): ?bool
	{
		return $this->getPasswordRequestedAt() instanceof \DateTimeInterface &&
			   $this->getPasswordRequestedAt()->getTimestamp() + $ttl > time();
	}

	/**
	 * @see UserInterface
	 */
	public function getRoles(): array
	{
		$roles = $this->roles;
		// guarantee every user at least has ROLE_USER
		$roles[] = static::ROLE_DEFAULT;

		return array_unique($roles);
	}

	/**
	 * @see UserInterface
	 */
	public function setRoles(array $roles): self
	{
		$this->roles = array();

		foreach ($roles as $role) {
			$this->addRole($role);
		}

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function addRole(string $role): self
	{
		$role = strtoupper($role);
		if ($role === static::ROLE_DEFAULT) {
			return $this;
		}
		if (!in_array($role, $this->roles, true)) {
			$this->roles[] = $role;
		}

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function removeRole(string $role): self
	{
		if (false !== $key = array_search(strtoupper($role), $this->roles, true)) {
			unset($this->roles[$key]);
			$this->roles = array_values($this->roles);
		}

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function hasRole(string $role): ?bool
	{
		return in_array(strtoupper($role), $this->getRoles(), true);
	}

	/**
	 * @see UserInterface
	 */
	public function isSuperAdmin(): ?bool
	{
		return $this->hasRole(static::ROLE_SUPER_ADMIN);
	}

	/**
	 * @see UserInterface
	 */
	public function setSuperAdmin(?bool $boolean): self
	{
		if (true === $boolean) {
			$this->addRole(static::ROLE_SUPER_ADMIN);
		} else {
			$this->removeRole(static::ROLE_SUPER_ADMIN);
		}

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getCredentialsExpired(): ?bool
	{
		return $this->credentials_expired;
	}

	/**
	 * @see UserInterface
	 */
	public function isCredentialsExpired(): ?bool
	{
		return $this->getCredentialsExpired();
	}

	/**
	 * @see UserInterface
	 */
	public function isCredentialsNonExpired(): ?bool
	{
		return !$this->getCredentialsExpired();
	}

	/**
	 * @see UserInterface
	 */
	public function setCredentialsExpired(?bool $credentials_expired): self
	{
		$this->credentials_expired = $credentials_expired;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getCredentialsExpireAt(): ?\DateTimeInterface
	{
		return $this->credentials_expire_at;
	}

	/**
	 * @see UserInterface
	 */
	public function setCredentialsExpireAt(?\DateTimeInterface $credentials_expire_at): self
	{
		$this->credentials_expire_at = $credentials_expire_at;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getPlainPassword()
	{
		return $this->plainPassword;
	}

	/**
	 * @see UserInterface
	 */
	public function setPlainPassword($password)
	{
		$this->plainPassword = $password;

		return $this;
	}

	/**
	 * @return string
	 */
	public function __toString(): string
	{
		return (string) $this->getUsername();
	}

	/**
	 * @see UserInterface
	 */
	public function eraseCredentials()
	{
		// If you store any temporary, sensitive data on the user, clear it here
		$this->plainPassword = null;
	}

}
