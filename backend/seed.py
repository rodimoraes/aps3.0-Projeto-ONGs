# backend/seed.py
"""
Popula o banco de dados bd_encontreong com um ecossistema COMPLETO de teste:
- 20 Usuários (10 Voluntários / 10 Representantes de ONG)
- 20 ONGs (distribuídas em 4 categorias)
- 45 Campanhas (cada ONG com 1 a 4 campanhas)
- Inscrições de voluntários e Galeria de Imagens.

Uso:
    cd backend
    python seed.py

Senha padrão de TODOS os usuários: Senha123!
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import mysql.connector
from dotenv import load_dotenv
from auth import gerar_hash_senha

load_dotenv()

SENHA_PADRAO = "Senha123!"


def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database=os.getenv("DB_NAME", "bd_encontreong"),
    )


# ============================================================
# AUTO-MIGRATION — corrige colunas que estavam com tipo errado
# ============================================================
def corrigir_schema(cursor):
    print("🔧  Verificando e corrigindo schema...")
    correcoes = [
        ("ong",    "telefone",   "VARCHAR(20) NULL"),
        ("ong",    "RCPJ",       "VARCHAR(30) NOT NULL"),
        ("ong",    "logo_url",   "VARCHAR(500) NULL"),
        ("ong",    "banner_url", "VARCHAR(500) NULL"),
        ("imagem", "url",        "VARCHAR(500) NOT NULL"),
    ]

    for tabela, coluna, tipo in correcoes:
        try:
            cursor.execute(f"ALTER TABLE {tabela} MODIFY {coluna} {tipo}")
        except mysql.connector.Error:
            pass
    print("✅  Schema verificado.\n")


# ============================================================
# LIMPEZA
# ============================================================
def limpar_banco(cursor):
    print("🧹  Limpando tabelas e resetando IDs...")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for tabela in [
        "voluntario_campanha",
        "imagem",
        "campanha",
        "ong",
        "usuario",
        "categoria",
    ]:
        cursor.execute(f"TRUNCATE TABLE {tabela}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    cursor.execute("""
        INSERT IGNORE INTO tipo_campanha (id_tipo_campanha, nome) VALUES
            (1, 'Arrecadação'),
            (2, 'Voluntariado')
    """)


# ============================================================
# CATEGORIAS
# ============================================================
def seed_categorias(cursor):
    print("📁  Inserindo categorias...")
    cursor.executemany(
        "INSERT INTO categoria (id_categoria, nome) VALUES (%s, %s)",
        [
            (1, "Educação / Assistência"),
            (2, "Meio Ambiente"),
            (3, "Saúde"),
            (4, "Cultura / Esporte"),
        ],
    )


# ============================================================
# USUÁRIOS (20)
# ============================================================
def seed_usuarios(cursor):
    print("👥  Inserindo 20 usuários...")
    senha_hash = gerar_hash_senha(SENHA_PADRAO)

    usuarios = [
        # --- VOLUNTÁRIOS (IDs 1 a 10) ---
        ("João Silva",       "111.111.111-11", "Rua A, 100 - Centro - São Paulo/SP - CEP 01000-000",        "solteiro",   "joao@email.com",     senha_hash, "1990-05-15", "(11) 98765-4321", True,  False),
        ("Maria Santos",     "222.222.222-22", "Rua B, 200 - Jardim Paulista - São Paulo/SP - CEP 02000-000", "casado",     "maria@email.com",    senha_hash, "1985-08-22", "(11) 98765-4322", True,  False),
        ("Fernanda Rocha",   "333.333.333-33", "Rua F, 600 - Pinheiros - São Paulo/SP - CEP 04000-000",       "solteiro",   "fernanda@email.com", senha_hash, "1995-02-28", "(11) 98765-4326", True,  False),
        ("Lucas Almeida",    "444.444.444-44", "Rua G, 700 - Batel - Curitiba/PR - CEP 80000-000",            "solteiro",   "lucas@email.com",    senha_hash, "1993-09-12", "(41) 98765-4327", True,  False),
        ("Julia Ferreira",   "555.555.555-55", "Rua H, 800 - Moinhos - Porto Alegre/RS - CEP 90000-000",      "casado",     "julia@email.com",    senha_hash, "1988-12-03", "(51) 98765-4328", True,  False),
        ("Roberto Nunes",    "666.666.666-66", "Av. Atlântica, 1500 - Copacabana - Rio de Janeiro/RJ",        "solteiro",   "roberto@email.com",  senha_hash, "1991-11-20", "(21) 98888-1111", True,  False),
        ("Camila Souza",     "777.777.777-77", "Rua da Praia, 300 - Centro - Florianópolis/SC",               "casado",     "camila@email.com",   senha_hash, "1989-04-10", "(48) 97777-2222", True,  False),
        ("Thiago Martins",   "888.888.888-88", "Av. Brasil, 500 - Funcionários - Belo Horizonte/MG",          "divorciado", "thiago@email.com",   senha_hash, "1982-07-05", "(31) 96666-3333", True,  False),
        ("Amanda Oliveira",  "999.999.999-99", "Rua das Flores, 100 - Jardins - Aracaju/SE",                  "solteiro",   "amanda@email.com",   senha_hash, "1998-02-14", "(79) 95555-4444", True,  False),
        ("Bruno Costa",      "000.000.000-00", "Av. Beira Mar, 400 - Meireles - Fortaleza/CE",                "solteiro",   "bruno@email.com",    senha_hash, "1994-12-01", "(85) 94444-5555", True,  False),

        # --- REPRESENTANTES (IDs 11 a 20) ---
        ("Pedro Oliveira",   "123.123.123-12", "Rua C, 300 - Vila Mariana - São Paulo/SP",                    "casado",     "pedro@email.com",    senha_hash, "1980-03-10", "(11) 98765-4323", False, True),
        ("Ana Costa",        "234.234.234-23", "Rua D, 400 - Lagoa - Rio de Janeiro/RJ",                      "solteiro",   "ana@email.com",      senha_hash, "1992-11-05", "(21) 98765-4324", False, True),
        ("Carlos Lima",      "345.345.345-34", "Rua E, 500 - Savassi - Belo Horizonte/MG",                    "divorciado", "carlos@email.com",   senha_hash, "1978-07-18", "(31) 98765-4325", False, True),
        ("Gabriel Pereira",  "456.456.456-45", "Rua I, 900 - Barra - Salvador/BA",                            "solteiro",   "gabriel@email.com",  senha_hash, "1987-04-20", "(71) 98765-4329", False, True),
        ("Larissa Rodrigues","567.567.567-56", "Rua J, 1000 - Boa Viagem - Recife/PE",                        "casado",     "larissa@email.com",  senha_hash, "1983-06-08", "(81) 98765-4330", False, True),
        ("Marcelo Ramos",    "678.678.678-67", "Rua K, 1100 - Aldeota - Fortaleza/CE",                        "solteiro",   "marcelo@email.com",  senha_hash, "1981-09-25", "(85) 98888-6666", False, True),
        ("Beatriz Alves",    "789.789.789-78", "Rua L, 1200 - Setor Bueno - Goiânia/GO",                      "casado",     "beatriz@email.com",  senha_hash, "1986-05-30", "(62) 97777-7777", False, True),
        ("Rodrigo Mendes",   "890.890.890-89", "Rua M, 1300 - Asa Sul - Brasília/DF",                         "divorciado", "rodrigo@email.com",  senha_hash, "1975-11-12", "(61) 96666-8888", False, True),
        ("Patrícia Nogueira","901.901.901-90", "Rua N, 1400 - Moema - São Paulo/SP",                          "solteiro",   "patricia@email.com", senha_hash, "1990-08-08", "(11) 95555-9999", False, True),
        ("Felipe Duarte",    "012.012.012-01", "Rua O, 1500 - Trindade - Florianópolis/SC",                    "casado",     "felipe@email.com",   senha_hash, "1984-01-20", "(48) 94444-0000", False, True),
    ]

    cursor.executemany(
        """
        INSERT INTO usuario
            (nome, cpf, endereco, estado_civil, email, senha,
             data_nascimento, celular, voluntario, representante_ong)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        usuarios,
    )


# ============================================================
# ONGs (20)
# ============================================================
def seed_ongs(cursor):
    print("🏢  Inserindo 20 ONGs...")
    
    ongs = [
        # Categoria 1 - Educação / Assistência
        ("Instituto Esperança", "https://picsum.photos/seed/ong1/200/200", "https://picsum.photos/seed/bg1/1200/400", 11, 1, "(11) 3000-0001", "Av. Paulista, 1000 - Bela Vista - São Paulo/SP", "Instituto Esperança de Assistência Social", "IE", "Promover assistência social a famílias em situação de vulnerabilidade.", "11.111.111/0001-11", "9430-8/00", "1111111", "PIX: contato@esperanca.org.br"),
        ("Educação para o Futuro", "https://picsum.photos/seed/ong2/200/200", "https://picsum.photos/seed/bg2/1200/400", 15, 1, "(81) 3000-0002", "Av. Boa Viagem, 2000 - Boa Viagem - Recife/PE", "Educação para o Futuro Organização Social", "EPF", "Oferecer educação de qualidade e oportunidades para crianças e jovens.", "22.222.222/0001-22", "8513-9/00", "2222222", "Doe material escolar | Voluntariado em reforço"),
        ("Amigos do Bem", "https://picsum.photos/seed/ong3/200/200", "https://picsum.photos/seed/bg3/1200/400", 16, 1, "(85) 3000-0003", "Rua K, 1100 - Aldeota - Fortaleza/CE", "Associação Amigos do Bem", "ADB", "Combate à pobreza e à fome no sertão nordestino.", "33.333.333/0001-33", "9430-8/00", "3333333", "Seja padrinho de uma criança | Doações de cestas"),
        ("Lar das Crianças", "https://picsum.photos/seed/ong4/200/200", "https://picsum.photos/seed/bg4/1200/400", 19, 1, "(11) 3000-0004", "Rua N, 1400 - Moema - São Paulo/SP", "Lar das Crianças Felizes", "LCF", "Acolhimento e educação para crianças em risco social.", "44.444.444/0001-44", "8711-5/01", "4444444", "Doações de roupas e brinquedos | Voluntariado aos fins de semana"),
        ("Mãos Unidas", "https://picsum.photos/seed/ong5/200/200", "https://picsum.photos/seed/bg5/1200/400", 17, 1, "(62) 3000-0005", "Rua L, 1200 - Setor Bueno - Goiânia/GO", "Mãos Unidas Assistência Social", "MUAS", "Apoio a idosos e pessoas com deficiência.", "55.555.555/0001-55", "8730-1/01", "5555555", "Visitas a asilos | Doações de fraldas geriátricas"),
        
        # Categoria 2 - Meio Ambiente
        ("Verde Vivo", "https://picsum.photos/seed/ong6/200/200", "https://picsum.photos/seed/bg6/1200/400", 12, 2, "(21) 3000-0006", "Rua das Palmeiras, 250 - Lagoa - Rio de Janeiro/RJ", "Verde Vivo Instituto de Preservação Ambiental", "VV", "Preservação ambiental e educação ecológica.", "66.666.666/0001-66", "0210-1/00", "6666666", "Mutirões de limpeza | Doe mudas nativas"),
        ("SOS Mata Atlântica", "https://picsum.photos/seed/ong7/200/200", "https://picsum.photos/seed/bg7/1200/400", 17, 2, "(61) 3000-0007", "Rua M, 1300 - Asa Sul - Brasília/DF", "SOS Mata Atlântica Brasil", "SOSMA", "Defesa da floresta e da biodiversidade.", "77.777.777/0001-77", "0210-1/00", "7777777", "Adote uma árvore | Denuncie desmatamento"),
        ("Oceano Limpo", "https://picsum.photos/seed/ong8/200/200", "https://picsum.photos/seed/bg8/1200/400", 20, 2, "(48) 3000-0008", "Rua O, 1500 - Trindade - Florianópolis/SC", "Instituto Oceano Limpo", "IOL", "Combate à poluição marinha e proteção de tartarugas.", "88.888.888/0001-88", "0210-1/00", "8888888", "Participe dos mutirões de praia | Doe para o resgate de animais"),
        ("Recicla Mais", "https://picsum.photos/seed/ong9/200/200", "https://picsum.photos/seed/bg9/1200/400", 16, 2, "(85) 3000-0009", "Rua K, 1100 - Aldeota - Fortaleza/CE", "Cooperativa Recicla Mais", "RCM", "Educação ambiental e apoio a catadores de recicláveis.", "99.999.999/0001-99", "3831-7/00", "9999999", "Doe seus recicláveis em nossos pontos de coleta"),
        ("Amazônia Protegida", "https://picsum.photos/seed/ong10/200/200", "https://picsum.photos/seed/bg10/1200/400", 18, 2, "(61) 3000-0010", "Rua M, 1300 - Asa Sul - Brasília/DF", "Movimento Amazônia Protegida", "MAP", "Proteção das comunidades indígenas e da floresta.", "10.101.101/0001-10", "0210-1/00", "1010101", "Assine petições | Doe para projetos de reflorestamento"),

        # Categoria 3 - Saúde
        ("Saúde para Todos", "https://picsum.photos/seed/ong11/200/200", "https://picsum.photos/seed/bg11/1200/400", 13, 3, "(31) 3000-0011", "Rua E, 500 - Savassi - Belo Horizonte/MG", "Saúde para Todos Associação Beneficente", "SPT", "Promoção da saúde e bem-estar em comunidades carentes.", "11.222.333/0001-44", "8610-1/01", "1122334", "Doações de medicamentos | Voluntariado em campanhas"),
        ("Médicos da Rua", "https://picsum.photos/seed/ong12/200/200", "https://picsum.photos/seed/bg12/1200/400", 14, 3, "(71) 3000-0012", "Rua I, 900 - Barra - Salvador/BA", "Médicos da Rua Brasil", "MRB", "Atendimento médico gratuito à população em situação de rua.", "22.333.444/0001-55", "8610-1/01", "2233445", "Seja médico voluntário | Doe kits de higiene"),
        ("Rede Feminina", "https://picsum.photos/seed/ong13/200/200", "https://picsum.photos/seed/bg13/1200/400", 19, 3, "(11) 3000-0013", "Rua N, 1400 - Moema - São Paulo/SP", "Rede Feminina de Apoio à Saúde", "RFAS", "Prevenção ao câncer de mama e apoio a mulheres.", "33.444.555/0001-66", "8610-1/01", "3344556", "Doe cabelos | Participe das caminhadas do Outubro Rosa"),
        ("Doe Sangue", "https://picsum.photos/seed/ong14/200/200", "https://picsum.photos/seed/bg14/1200/400", 15, 3, "(81) 3000-0014", "Av. Boa Viagem, 2000 - Boa Viagem - Recife/PE", "Associação Doe Sangue", "ADS", "Mobilização de doadores de sangue para hemocentros.", "44.555.666/0001-77", "8610-1/01", "4455667", "Seja um doador de sangue frequente"),
        ("Mental Vida", "https://picsum.photos/seed/ong15/200/200", "https://picsum.photos/seed/bg15/1200/400", 11, 3, "(11) 3000-0015", "Av. Paulista, 1000 - Bela Vista - São Paulo/SP", "Instituto Mental Vida", "IMV", "Apoio psicológico gratuito e prevenção ao suicídio.", "55.666.777/0001-88", "8650-0/01", "5566778", "Voluntariado em escuta ativa | Doe para manter o atendimento"),

        # Categoria 4 - Cultura / Esporte
        ("Cultura Viva", "https://picsum.photos/seed/ong16/200/200", "https://picsum.photos/seed/bg16/1200/400", 14, 4, "(71) 3000-0016", "Rua I, 900 - Barra - Salvador/BA", "Cultura Viva Instituto de Arte e Cultura", "CV", "Fomentar a cultura e a arte como ferramentas de transformação social.", "66.777.888/0001-99", "8599-6/04", "6677889", "Doe instrumentos musicais | Seja professor voluntário"),
        ("Orquestra da Favela", "https://picsum.photos/seed/ong17/200/200", "https://picsum.photos/seed/bg17/1200/400", 12, 4, "(21) 3000-0017", "Rua das Palmeiras, 250 - Lagoa - Rio de Janeiro/RJ", "Orquestra da Favela", "OF", "Ensino de música clássica para jovens de comunidades.", "77.888.999/0001-10", "8592-9/03", "7788990", "Apadrinhe um músico | Doe instrumentos"),
        ("Esporte para Todos", "https://picsum.photos/seed/ong18/200/200", "https://picsum.photos/seed/bg18/1200/400", 13, 4, "(31) 3000-0018", "Rua E, 500 - Savassi - Belo Horizonte/MG", "Esporte para Todos", "EPT", "Inclusão social através do esporte e lazer.", "88.999.000/0001-21", "9319-1/01", "8899001", "Doe materiais esportivos | Seja treinador voluntário"),
        ("Arte na Rua", "https://picsum.photos/seed/ong19/200/200", "https://picsum.photos/seed/bg19/1200/400", 20, 4, "(48) 3000-0019", "Rua O, 1500 - Trindade - Florianópolis/SC", "Coletivo Arte na Rua", "CAR", "Intervenções artísticas e grafite em espaços públicos.", "99.000.111/0001-32", "8599-6/04", "9900112", "Doe tintas e materiais | Participe dos mutirões de pintura"),
        ("Teatro do Oprimido", "https://picsum.photos/seed/ong20/200/200", "https://picsum.photos/seed/bg20/1200/400", 18, 4, "(61) 3000-0020", "Rua M, 1300 - Asa Sul - Brasília/DF", "Grupo Teatro do Oprimido", "GTO", "Uso do teatro como ferramenta de diálogo e transformação social.", "00.111.222/0001-43", "8599-6/04", "0011223", "Seja ator voluntário | Doe figurinos e cenários"),
    ]

    cursor.executemany(
        """
        INSERT INTO ong (
            nome, logo_url, banner_url, id_usuario_representante, id_categoria,
            telefone, endereco, denominacao_social, sigla,
            objetivo_social_finalidade, RCPJ, CNAE, inscricao_municipal, como_ajudar
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        ongs,
    )


# ============================================================
# CAMPANHAS (45)
# ============================================================
def seed_campanhas(cursor):
    print("📣  Inserindo 45 campanhas (1 a 4 por ONG)...")
    campanhas = [
        # ONG 1 (3 campanhas) -> IDs 1, 2, 3
        (1, 1, "Cesta Básica Solidária", "Arrecadação de alimentos para 500 famílias.", "2026-01-15", "2026-06-30", 50000.00, 23500.00, "ativa"),
        (1, 1, "Brinquedos de Natal", "Arrecadação de brinquedos para crianças carentes.", "2026-10-01", "2026-12-20", 10000.00, 3200.00, "ativa"),
        (1, 2, "Voluntários para Eventos", "Precisamos de voluntários para os eventos mensais.", "2026-02-01", "2026-12-31", 20.00, 0.00, "ativa"),
        
        # ONG 2 (4 campanhas) -> IDs 4, 5, 6, 7
        (2, 1, "Material Escolar para Todos", "Arrecadação de material escolar para 300 crianças.", "2026-01-05", "2026-03-31", 25000.00, 25000.00, "encerrada"),
        (2, 2, "Aulas de Reforço Escolar", "Voluntários para reforço de matemática e português.", "2026-02-01", "2026-12-15", 30.00, 0.00, "ativa"),
        (2, 1, "Biblioteca Comunitária", "Construção de uma biblioteca com 2.000 livros.", "2026-06-01", "2026-12-31", 40000.00, 12000.00, "ativa"),
        (2, 1, "Computadores para o Futuro", "Arrecadação de laptops para laboratório de informática.", "2026-01-01", "2026-11-30", 35000.00, 5000.00, "ativa"),
        
        # ONG 3 (2 campanhas) -> IDs 8, 9
        (3, 1, "Natal Sem Fome no Sertão", "Cestas básicas e água para famílias do sertão.", "2026-11-01", "2026-12-24", 80000.00, 15000.00, "ativa"),
        (3, 2, "Voluntários para Construção", "Mutirão para construir cisternas.", "2026-03-01", "2026-08-30", 15.00, 0.00, "ativa"),
        
        # ONG 4 (2 campanhas) -> IDs 10, 11
        (4, 1, "Reforma do Lar", "Arrecadação para reformar o telhado do Lar das Crianças.", "2026-02-01", "2026-05-30", 15000.00, 15000.00, "encerrada"),
        (4, 2, "Contadores de Histórias", "Voluntários para ler histórias para as crianças.", "2026-01-01", "2026-12-31", 10.00, 0.00, "ativa"),
        
        # ONG 5 (2 campanhas) -> IDs 12, 13
        (5, 1, "Fraldas Geriátricas", "Doações de fraldas para o asilo parceiro.", "2026-01-10", "2026-12-31", 12000.00, 4500.00, "ativa"),
        (5, 2, "Companhia para Idosos", "Voluntários para passar o dia com idosos.", "2026-02-15", "2026-12-31", 20.00, 0.00, "ativa"),
        
        # ONG 6 (3 campanhas) -> IDs 14, 15, 16
        (6, 1, "Reflorestamento da Mata Atlântica", "Plantio de 5.000 mudas nativas.", "2026-03-01", "2026-09-30", 30000.00, 12800.00, "ativa"),
        (6, 2, "Mutirão de Limpeza nas Praias", "Ação mensal de limpeza nas praias do RJ.", "2026-01-10", "2026-12-20", 50.00, 0.00, "ativa"),
        (6, 1, "Adote uma Árvore", "Plante uma árvore no seu nome ou de alguém.", "2026-01-01", "2026-12-31", 5000.00, 1200.00, "ativa"),
        
        # ONG 7 (2 campanhas) -> IDs 17, 18
        (7, 1, "Proteja a Floresta", "Arrecadação para compra de equipamentos de fiscalização.", "2026-02-01", "2026-12-31", 20000.00, 8000.00, "ativa"),
        (7, 2, "Guardiões da Mata", "Voluntários para monitorar áreas de desmatamento.", "2026-04-01", "2026-10-31", 10.00, 0.00, "ativa"),
        
        # ONG 8 (2 campanhas) -> IDs 19, 20
        (8, 1, "Resgate de Tartarugas", "Doações para o centro de resgate de animais marinhos.", "2026-01-01", "2026-12-31", 25000.00, 10500.00, "ativa"),
        (8, 2, "Limpeza de Praia SC", "Mutirão de limpeza na praia da Joaquina.", "2026-02-01", "2026-03-30", 10.00, 0.00, "encerrada"),
        
        # ONG 9 (2 campanhas) -> IDs 21, 22
        (9, 1, "Reciclagem Solidária", "Arrecadação de fundos para os catadores.", "2026-01-01", "2026-12-31", 15000.00, 3000.00, "ativa"),
        (9, 2, "Educação Ambiental", "Voluntários para palestras em escolas.", "2026-03-01", "2026-11-30", 10.00, 0.00, "ativa"),
        
        # ONG 10 (2 campanhas) -> IDs 23, 24
        (10, 1, "Proteja a Amazônia", "Doações para projetos de preservação.", "2026-01-01", "2026-12-31", 50000.00, 32000.00, "ativa"),
        (10, 2, "Voluntariado Indígena", "Apoio em comunidades indígenas.", "2026-03-01", "2026-09-30", 15.00, 0.00, "ativa"),

        # ONG 11 (3 campanhas) -> IDs 25, 26, 27
        (11, 1, "Campanha do Agasalho 2026", "Arrecadação de roupas de frio.", "2026-04-01", "2026-08-31", 20000.00, 8900.00, "ativa"),
        (11, 2, "Doação de Sangue", "Mobilização de voluntários para doar sangue.", "2026-01-01", "2026-12-31", 100.00, 0.00, "ativa"),
        (11, 1, "Kits de Higiene", "Arrecadação de kits para moradores de rua.", "2026-01-01", "2026-12-31", 10000.00, 4000.00, "ativa"),
        
        # ONG 12 (2 campanhas) -> IDs 28, 29
        (12, 1, "Remédios para Todos", "Doações de medicamentos básicos.", "2026-02-01", "2026-11-30", 30000.00, 15000.00, "ativa"),
        (12, 2, "Médicos Voluntários", "Cadastro de médicos para atendimento na rua.", "2026-01-01", "2026-12-31", 50.00, 0.00, "ativa"),
        
        # ONG 13 (2 campanhas) -> IDs 30, 31
        (13, 1, "Outubro Rosa", "Arrecadação para exames de mamografia gratuitos.", "2026-09-01", "2026-10-31", 40000.00, 0.00, "ativa"),
        (13, 2, "Palestras nas Empresas", "Voluntárias para palestras sobre prevenção.", "2026-01-01", "2026-12-31", 10.00, 0.00, "ativa"),
        
        # ONG 14 (2 campanhas) -> IDs 32, 33
        (14, 1, "Doadores de Sangue", "Meta de novos doadores cadastrados.", "2026-01-01", "2026-12-31", 500.00, 120.00, "ativa"),
        (14, 2, "Caravana da Doação", "Voluntários para ônibus de doação.", "2026-03-01", "2026-09-30", 10.00, 0.00, "ativa"),
        
        # ONG 15 (2 campanhas) -> IDs 34, 35
        (15, 1, "Apoio Psicológico", "Manutenção do atendimento gratuito.", "2026-01-01", "2026-12-31", 20000.00, 8000.00, "ativa"),
        (15, 2, "Ouvir faz Bem", "Voluntários para escuta ativa.", "2026-02-01", "2026-12-31", 20.00, 0.00, "ativa"),

        # ONG 16 (3 campanhas) -> IDs 36, 37, 38
        (16, 1, "Instrumentos Musicais para Crianças", "Arrecadação para comprar instrumentos.", "2026-05-01", "2026-11-30", 15000.00, 5600.00, "ativa"),
        (16, 2, "Aulas de Música Voluntárias", "Professores voluntários para aulas semanais.", "2026-02-01", "2026-12-31", 15.00, 0.00, "ativa"),
        (16, 1, "Oficina de Teatro", "Materiais para oficinas de teatro.", "2026-01-01", "2026-12-31", 8000.00, 2000.00, "ativa"),
        
        # ONG 17 (2 campanhas) -> IDs 39, 40
        (17, 1, "Apadrinhe um Músico", "Doação mensal para manter os estudos.", "2026-01-01", "2026-12-31", 30000.00, 12000.00, "ativa"),
        (17, 2, "Concerto Solidário", "Voluntários para organização do evento.", "2026-10-01", "2026-11-30", 20.00, 0.00, "ativa"),
        
        # ONG 18 (2 campanhas) -> IDs 41, 42
        (18, 1, "Bolas e Redes", "Arrecadação de materiais esportivos.", "2026-02-01", "2026-10-31", 10000.00, 2500.00, "ativa"),
        (18, 2, "Treinadores Voluntários", "Voluntários para treinar os jovens.", "2026-01-01", "2026-12-31", 10.00, 0.00, "ativa"),
        
        # ONG 19 (1 campanha) -> ID 43
        (19, 1, "Tintas para a Rua", "Arrecadação para mutirão de grafite.", "2026-03-01", "2026-06-30", 5000.00, 5000.00, "encerrada"),
        
        # ONG 20 (2 campanhas) -> IDs 44, 45
        (20, 1, "Teatro na Praça", "Arrecadação para montagem de peças.", "2026-04-01", "2026-12-31", 12000.00, 3500.00, "ativa"),
        (20, 2, "Atores Voluntários", "Seletiva para atores amadores.", "2026-05-01", "2026-12-31", 10.00, 0.00, "ativa"),
    ]

    cursor.executemany(
        """
        INSERT INTO campanha (
            id_ong, id_tipo_campanha, titulo, descricao, data_inicio, data_fim,
            meta_arrecadacao, valor_arrecadado, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        campanhas,
    )


# ============================================================
# VOLUNTÁRIOS INSCRITOS
# ============================================================
def seed_voluntarios(cursor):
    print("🙋  Inscrevendo voluntários em campanhas...")
    # IDs válidos (1 a 45). Inscrições apenas em campanhas de Voluntariado (id_tipo = 2).
    # Campanhas de Voluntariado: 3, 5, 9, 11, 13, 15, 18, 20, 22, 24, 26, 29, 31, 33, 35, 37, 40, 42, 45
    inscricoes = [
        (1, 3), (2, 3), (3, 3), (4, 3),
        (5, 5), (6, 5), (7, 5),
        (8, 9), (9, 9), (10, 9),
        (1, 11), (2, 11), (3, 11),
        (4, 13), (5, 13), (6, 13),
        (7, 15), (8, 15), (9, 15), (10, 15),
        (1, 18), (2, 18),
        (3, 20), (4, 20), (5, 20),
        (6, 22), (7, 22),
        (8, 24), (9, 24), (10, 24),
        (1, 26), (2, 26), (3, 26),
        (4, 29), (5, 29),
        (6, 31), (7, 31), (8, 31),
        (9, 33), (10, 33),
        (1, 35), (2, 35),
        (3, 37), (4, 37), (5, 37),
        (6, 40), (7, 40),
        (8, 42), (9, 42),
        (10, 45), (1, 45),
    ]
    cursor.executemany(
        "INSERT INTO voluntario_campanha (id_usuario, id_campanha) VALUES (%s, %s)",
        inscricoes,
    )


# ============================================================
# IMAGENS
# ============================================================
def seed_imagens(cursor):
    print("🖼️   Inserindo imagens nas galerias...")
    imagens = []
    
    # Para cada ONG (1 a 20), adicionar 2 imagens de capa/galeria
    for i in range(1, 21):
        imagens.append((i, None, f"Foto da sede - ONG {i}", f"https://picsum.photos/seed/galeria_ong{i}/800/600"))
        imagens.append((i, None, f"Equipe em ação - ONG {i}", f"https://picsum.photos/seed/acao_ong{i}/800/600"))
        
    # Adicionar imagens específicas para algumas campanhas (IDs 1 a 45)
    campanhas_com_fotos = [1, 4, 6, 10, 14, 21, 25, 30, 36, 41]
    for c_id in campanhas_com_fotos:
        imagens.append((None, c_id, f"Registro da campanha {c_id}", f"https://picsum.photos/seed/campanha_img{c_id}/800/600"))

    cursor.executemany(
        "INSERT INTO imagem (id_ong, id_campanha, descricao, url) VALUES (%s, %s, %s, %s)",
        imagens,
    )


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 65)
    print("🌱  POPULANDO BANCO DE DADOS bd_encontreong (VERSAO ESTENDIDA)")
    print("=" * 65)
    print(f"🔑  Senha padrão de TODOS os usuários: {SENHA_PADRAO}")
    print()

    conexao = get_db()
    cursor = conexao.cursor()

    try:
        corrigir_schema(cursor)
        conexao.commit()

        limpar_banco(cursor)
        seed_categorias(cursor)
        seed_usuarios(cursor)
        seed_ongs(cursor)
        seed_campanhas(cursor)
        seed_voluntarios(cursor)
        seed_imagens(cursor)
        conexao.commit()

        print()
        print("=" * 65)
        print("✅  BANCO POPULADO COM SUCESSO!")
        print("=" * 65)
        print("📊  Resumo do novo ecossistema:")
        print("    20 usuários   (10 voluntários + 10 representantes)")
        print("    20 ONGs       (5 por categoria)")
        print("    45 campanhas  (mistura de arrecadação e voluntariado)")
        print("    49 inscrições de voluntários em campanhas")
        print("    50 imagens    (2 por ONG + fotos de campanhas)")
        print()
        print(f"🔑  Credenciais de teste (senha: {SENHA_PADRAO}):")
        print()
        print("    👤 VOLUNTÁRIOS (IDs 1-10)")
        print("       joao@email.com, maria@email.com, fernanda@email.com, lucas@email.com")
        print("       julia@email.com, roberto@email.com, camila@email.com, thiago@email.com")
        print("       amanda@email.com, bruno@email.com")
        print()
        print("    🏢 REPRESENTANTES DE ONG (IDs 11-20)")
        print("       pedro@email.com     — Instituto Esperança")
        print("       ana@email.com       — Verde Vivo")
        print("       carlos@email.com    — Saúde para Todos")
        print("       gabriel@email.com   — Cultura Viva")
        print("       larissa@email.com   — Educação para o Futuro")
        print("       marcelo@email.com   — Amigos do Bem")
        print("       beatriz@email.com   — SOS Mata Atlântica")
        print("       rodrigo@email.com   — Oceano Limpo")
        print("       patricia@email.com  — Lar das Crianças")
        print("       felipe@email.com    — Orquestra da Favela")
        print()
    except Exception as e:
        conexao.rollback()
        print(f"\n❌  ERRO: {e}")
        raise
    finally:
        cursor.close()
        conexao.close()


if __name__ == "__main__":
    main()