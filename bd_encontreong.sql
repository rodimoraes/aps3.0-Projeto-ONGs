-- Banco de Dados
-- // Comando para criar o Banco de Dados MySQL

-- COLOCAR O VOLUNTARIO E O REPRESENTANTE_ONG COMO DEFAULT FALSE OU 0

drop database bd_encontreong;

create database bd_encontreong;
use bd_encontreong;

CREATE TABLE usuario
(
id_usuario INT PRIMARY KEY AUTO_INCREMENT,  
 nome VARCHAR(100),  
 cpf VARCHAR(20),  
 endereco VARCHAR(255),  
 estado_civil VARCHAR(100) NOT NULL,  
 email VARCHAR(100) NOT NULL,  
 data_nascimento DATE NOT NULL,  
 celular VARCHAR(20) NOT NULL,
senha VARCHAR(255) NOT NULL,
voluntario BOOLEAN NOT NULL,  
 representante_ong BOOLEAN NOT NULL,  
 UNIQUE (cpf,email,celular)
);

CREATE TABLE ong
(
id_ong INT PRIMARY KEY AUTO_INCREMENT,  
nome VARCHAR(100),
logo_url VARCHAR(150),
banner_url VARCHAR(150),
id_usuario_representante INT,  
id_categoria INT NOT NULL,  
telefone INT,  
endereco VARCHAR(100),  
denominacao_social VARCHAR(100) NOT NULL,  
sigla VARCHAR(100),  
objetivo_social_finalidade VARCHAR(100) NOT NULL,  
RCPJ INT NOT NULL,  
CNAE VARCHAR(100) NOT NULL,  
inscricao_municipal VARCHAR(100) NOT NULL,  
como_ajudar VARCHAR(100)  
);

CREATE TABLE tipo_campanha
(
id_tipo_campanha INT PRIMARY KEY AUTO_INCREMENT,  
 nome VARCHAR(100) NOT NULL unique 
);

INSERT IGNORE INTO tipo_campanha (id_tipo_campanha, nome) VALUES
(1, 'Arrecadação'),
(2, 'Voluntariado');

CREATE TABLE campanha (
id_campanha INT AUTO_INCREMENT PRIMARY KEY,
id_ong INT NOT NULL,
id_tipo_campanha int not null DEFAULT 1,
titulo VARCHAR(150) NOT NULL,
descricao TEXT NOT NULL,
data_inicio DATE NOT NULL,
data_fim DATE,
meta_arrecadacao DECIMAL(10, 2),
valor_arrecadado DECIMAL(10, 2) DEFAULT 0.00,
status VARCHAR(50) DEFAULT 'ativa',
FOREIGN KEY (id_ong) REFERENCES ong(id_ong) ON DELETE cascade,
FOREIGN KEY (id_tipo_campanha) REFERENCES tipo_campanha(id_tipo_campanha)

);

CREATE TABLE imagem (
id_img INT AUTO_INCREMENT PRIMARY KEY,
id_ong INT,
id_campanha INT,
descricao VARCHAR(150) NOT NULL,
url VARCHAR(150) NOT NULL,
unique(url),
FOREIGN KEY (id_ong) REFERENCES ong(id_ong) ON DELETE CASCADE,
FOREIGN KEY (id_campanha) REFERENCES campanha(id_campanha) ON DELETE CASCADE
);

CREATE TABLE categoria
(
id_categoria INT PRIMARY KEY AUTO_INCREMENT,  
 nome VARCHAR(100)  
);



CREATE TABLE voluntario_campanha (
 id_voluntario_campanha INT AUTO_INCREMENT PRIMARY KEY,
 id_usuario INT NOT NULL,
 id_campanha INT NOT NULL,
 data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
 status VARCHAR(30) DEFAULT 'inscrito',
 UNIQUE KEY uk_usuario_campanha (id_usuario, id_campanha),
 FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
 FOREIGN KEY (id_campanha) REFERENCES campanha(id_campanha) ON DELETE CASCADE
);

-- ALTER TABLE ong ADD FOREIGN KEY(id_usuario_representante) REFERENCES usuario (id_usuario_representante);
-- ALTER TABLE ong ADD FOREIGN KEY(id_categoria) REFERENCES categoria (id_categoria);
-- ALTER TABLE campanha ADD FOREIGN KEY(id_ong) REFERENCES ong (id_ong);
-- ALTER TABLE campanha ADD FOREIGN KEY(id_tipo_campanha) REFERENCES tipo_campanha (id_tipo_campanha);
-- ALTER TABLE voluntario_campanha ADD FOREIGN KEY(id_campanha) REFERENCES campanha (id_campanha);
-- ALTER TABLE voluntario_campanha ADD FOREIGN KEY(id_usuario) REFERENCES usuario (id_usuario);

----------------------FIM-----------------------------
