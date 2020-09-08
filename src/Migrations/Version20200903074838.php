<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200903074838 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR(180) NOT NULL, username_canonical VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, email_canonical VARCHAR(255) NOT NULL, enabled BOOLEAN NOT NULL, salt VARCHAR(255) DEFAULT NULL, password VARCHAR(255) NOT NULL, last_login DATETIME DEFAULT NULL, locked BOOLEAN DEFAULT NULL, expired BOOLEAN DEFAULT NULL, expires_at DATETIME DEFAULT NULL, confirmation_token VARCHAR(255) DEFAULT NULL, password_requested_at DATETIME DEFAULT NULL, roles CLOB NOT NULL --(DC2Type:json)
        , credentials_expired BOOLEAN DEFAULT NULL, credentials_expire_at DATETIME DEFAULT NULL)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON user (username)');
        $this->addSql("INSERT INTO user (username,username_canonical,email,email_canonical,enabled,salt,password,last_login,locked,expired,expires_at,confirmation_token,password_requested_at,roles,credentials_expired,credentials_expire_at) VALUES ('admin','admin','admin@domain.fr','admin@domain.fr',1,NULL,'','2016-08-05 18:18:42',0,0,NULL,NULL,NULL,'[\"ROLE_SUPER_ADMIN\",\"ROLE_USER\"]',0,NULL)");
        $this->addSql("INSERT INTO user (username,username_canonical,email,email_canonical,enabled,salt,password,last_login,locked,expired,expires_at,confirmation_token,password_requested_at,roles,credentials_expired,credentials_expire_at) VALUES ('guest','guest','guest@domain.fr','guest@domain.fr',1,NULL,'','2016-03-10 22:50:21',0,0,NULL,NULL,NULL,'[\"ROLE_USER\"]',0,NULL)");
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE user');
    }
}
