# backend/seed.py
"""
Popula o banco de dados bd_encontreong com dados de teste realistas.
Também corrige automaticamente o schema (telefone/RCPJ que eram INT).

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
    """
    Converte colunas INT que deveriam ser VARCHAR.
    Idempotente: rodar várias vezes é seguro.
    """
    print("🔧  Verificando e corrigindo schema...")

    # (tabela, coluna, novo_tipo_completo)
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
            print(f"    ✓  {tabela}.{coluna}  →  {tipo}")
        except mysql.connector.Error as e:
            print(f"    ⚠  {tabela}.{coluna}: {e}")

    print("✅  Schema verificado.\n")


# ============================================================
# LIMPEZA
# ============================================================
def limpar_banco(cursor):
    print("🧹  Limpando tabelas...")
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
# USUÁRIOS (10)
# ============================================================
def seed_usuarios(cursor):
    print("👥  Inserindo 10 usuários...")
    senha_hash = gerar_hash_senha(SENHA_PADRAO)

    usuarios = [
        ("João Silva",       "111.111.111-11", "Rua A, 100 - Centro - São Paulo/SP - CEP 01000-000",        "solteiro",   "joao@email.com",     senha_hash, "1990-05-15", "(11) 98765-4321", True,  False),
        ("Maria Santos",     "222.222.222-22", "Rua B, 200 - Jardim Paulista - São Paulo/SP - CEP 02000-000", "casado",     "maria@email.com",    senha_hash, "1985-08-22", "(11) 98765-4322", True,  False),
        ("Pedro Oliveira",   "333.333.333-33", "Rua C, 300 - Vila Mariana - São Paulo/SP - CEP 03000-000",    "casado",     "pedro@email.com",    senha_hash, "1980-03-10", "(11) 98765-4323", False, True),
        ("Ana Costa",        "444.444.444-44", "Rua D, 400 - Copacabana - Rio de Janeiro/RJ - CEP 20000-000", "solteiro",   "ana@email.com",      senha_hash, "1992-11-05", "(21) 98765-4324", False, True),
        ("Carlos Lima",      "555.555.555-55", "Rua E, 500 - Savassi - Belo Horizonte/MG - CEP 30000-000",    "divorciado", "carlos@email.com",   senha_hash, "1978-07-18", "(31) 98765-4325", False, True),
        ("Fernanda Rocha",   "666.666.666-66", "Rua F, 600 - Pinheiros - São Paulo/SP - CEP 04000-000",       "solteiro",   "fernanda@email.com", senha_hash, "1995-02-28", "(11) 98765-4326", True,  False),
        ("Lucas Almeida",    "777.777.777-77", "Rua G, 700 - Batel - Curitiba/PR - CEP 80000-000",            "solteiro",   "lucas@email.com",    senha_hash, "1993-09-12", "(41) 98765-4327", True,  False),
        ("Julia Ferreira",   "888.888.888-88", "Rua H, 800 - Moinhos - Porto Alegre/RS - CEP 90000-000",      "casado",     "julia@email.com",    senha_hash, "1988-12-03", "(51) 98765-4328", True,  False),
        ("Gabriel Pereira",  "999.999.999-99", "Rua I, 900 - Barra - Salvador/BA - CEP 40000-000",            "solteiro",   "gabriel@email.com",  senha_hash, "1987-04-20", "(71) 98765-4329", False, True),
        ("Larissa Rodrigues","123.456.789-01", "Rua J, 1000 - Boa Viagem - Recife/PE - CEP 50000-000",        "casado",     "larissa@email.com",  senha_hash, "1983-06-08", "(81) 98765-4330", False, True),
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
# ONGs (5)
# ============================================================
def seed_ongs(cursor):
    print("🏢  Inserindo 5 ONGs...")
    ongs = [
        (
            "Instituto Esperança",
            "https://picsum.photos/seed/esperanca-logo/200/200",
            "https://picsum.photos/seed/esperanca-banner/1200/400",
            3, 1,
            "(11) 3000-0001",
            "Av. Paulista, 1000 - Bela Vista - São Paulo/SP - CEP 01310-100",
            "Instituto Esperança de Assistência Social",
            "IE",
            "Promover assistência social a famílias em situação de vulnerabilidade.",
            "12.345.678/0001-90",
            "9430-8/00",
            "1234567-8",
            "Doações via PIX: contato@institutoesperanca.org.br",
        ),
        (
            "Verde Vivo",
            "https://picsum.photos/seed/verdevivo-logo/200/200",
            "https://picsum.photos/seed/verdevivo-banner/1200/400",
            4, 2,
            "(21) 3000-0002",
            "Rua das Palmeiras, 250 - Lagoa - Rio de Janeiro/RJ - CEP 22470-000",
            "Verde Vivo Instituto de Preservação Ambiental",
            "VV",
            "Preservação ambiental e educação ecológica nas comunidades.",
            "23.456.789/0001-01",
            "0210-1/00",
            "2345678-9",
            "Participe dos mutirões de limpeza | Doe mudas de árvores",
        ),
        (
            "Saúde para Todos",
            "https://picsum.photos/seed/saudetodos-logo/200/200",
            "https://picsum.photos/seed/saudetodos-banner/1200/400",
            5, 3,
            "(31) 3000-0003",
            "Av. Afonso Pena, 1500 - Centro - Belo Horizonte/MG - CEP 30130-000",
            "Saúde para Todos Associação Beneficente",
            "SPT",
            "Promoção da saúde e bem-estar em comunidades carentes.",
            "34.567.890/0001-12",
            "8610-1/01",
            "3456789-0",
            "Doações de medicamentos | Voluntariado em campanhas",
        ),
        (
            "Cultura Viva",
            "https://picsum.photos/seed/culturaviva-logo/200/200",
            "https://picsum.photos/seed/culturaviva-banner/1200/400",
            9, 4,
            "(71) 3000-0004",
            "Rua Chile, 500 - Centro - Salvador/BA - CEP 40020-000",
            "Cultura Viva Instituto de Arte e Cultura",
            "CV",
            "Fomentar a cultura e a arte como ferramentas de transformação social.",
            "45.678.901/0001-23",
            "8599-6/04",
            "4567890-1",
            "Doe instrumentos musicais | Seja professor voluntário",
        ),
        (
            "Educação para o Futuro",
            "https://picsum.photos/seed/educafuturo-logo/200/200",
            "https://picsum.photos/seed/educafuturo-banner/1200/400",
            10, 1,
            "(81) 3000-0005",
            "Av. Boa Viagem, 2000 - Boa Viagem - Recife/PE - CEP 51020-000",
            "Educação para o Futuro Organização Social",
            "EPF",
            "Oferecer educação de qualidade e oportunidades para crianças e jovens.",
            "56.789.012/0001-34",
            "8513-9/00",
            "5678901-2",
            "Doe material escolar | Seja voluntário em aulas de reforço",
        ),
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
# CAMPANHAS (12)
# ============================================================
def seed_campanhas(cursor):
    print("📣  Inserindo 12 campanhas...")
    campanhas = [
        (1, 1, "Cesta Básica Solidária",
         "Arrecadação de alimentos para 500 famílias em situação de vulnerabilidade durante o inverno.",
         "2026-01-15", "2026-06-30", 50000.00, 23500.00, "ativa"),
        (1, 1, "Brinquedos de Natal",
         "Campanha de arrecadação de brinquedos novos e usados para crianças carentes.",
         "2026-10-01", "2026-12-20", 10000.00, 3200.00, "ativa"),
        (1, 2, "Voluntários para Eventos",
         "Precisamos de voluntários para ajudar nos eventos mensais da ONG.",
         "2026-02-01", "2026-12-31", 20.00, 0.00, "ativa"),
        (2, 1, "Reflorestamento da Mata Atlântica",
         "Plantio de 5.000 mudas nativas em áreas degradadas da Mata Atlântica.",
         "2026-03-01", "2026-09-30", 30000.00, 12800.00, "ativa"),
        (2, 2, "Mutirão de Limpeza nas Praias",
         "Ação mensal de limpeza nas praias do Rio de Janeiro.",
         "2026-01-10", "2026-12-20", 50.00, 0.00, "ativa"),
        (3, 1, "Campanha do Agasalho 2026",
         "Arrecadação de roupas de frio para distribuição em comunidades carentes.",
         "2026-04-01", "2026-08-31", 20000.00, 8900.00, "ativa"),
        (3, 2, "Doação de Sangue",
         "Mobilização de voluntários para doação de sangue no Hemominas.",
         "2026-01-01", "2026-12-31", 100.00, 0.00, "ativa"),
        (4, 1, "Instrumentos Musicais para Crianças",
         "Arrecadação para comprar instrumentos para oficinas de música.",
         "2026-05-01", "2026-11-30", 15000.00, 5600.00, "ativa"),
        (4, 2, "Aulas de Música Voluntárias",
         "Professores voluntários para dar aulas semanais de música.",
         "2026-02-01", "2026-12-31", 15.00, 0.00, "ativa"),
        (5, 1, "Material Escolar para Todos",
         "Arrecadação de material escolar para 300 crianças no início do ano letivo.",
         "2026-01-05", "2026-03-31", 25000.00, 25000.00, "encerrada"),
        (5, 2, "Aulas de Reforço Escolar",
         "Voluntários para dar aulas de reforço de matemática e português.",
         "2026-02-01", "2026-12-15", 30.00, 0.00, "ativa"),
        (5, 1, "Biblioteca Comunitária",
         "Construção de uma biblioteca comunitária com 2.000 livros.",
         "2026-06-01", "2026-12-31", 40000.00, 12000.00, "ativa"),
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
# VOLUNTÁRIOS INSCRITOS (17)
# ============================================================
def seed_voluntarios(cursor):
    print("🙋  Inscrevendo voluntários em campanhas (17 inscrições)...")
    inscricoes = [
        (1, 3), (2, 3), (6, 3),
        (1, 5), (7, 5), (8, 5),
        (2, 7), (6, 7), (8, 7), (10, 7),
        (7, 9), (8, 9),
        (1, 11), (2, 11), (6, 11), (7, 11), (8, 11),
    ]
    cursor.executemany(
        "INSERT INTO voluntario_campanha (id_usuario, id_campanha) VALUES (%s, %s)",
        inscricoes,
    )


# ============================================================
# IMAGENS (11)
# ============================================================
def seed_imagens(cursor):
    print("🖼️   Inserindo 11 imagens na galeria...")
    imagens = [
        (1, None, "Fachada do Instituto Esperança", "https://picsum.photos/seed/ie-sede/800/600"),
        (1, None, "Equipe de voluntários em ação",  "https://picsum.photos/seed/ie-equipe/800/600"),
        (2, None, "Área de reflorestamento",        "https://picsum.photos/seed/vv-refloresta/800/600"),
        (2, None, "Mutirão de limpeza",             "https://picsum.photos/seed/vv-limpeza/800/600"),
        (3, None, "Campanha de vacinação",          "https://picsum.photos/seed/spt-vacina/800/600"),
        (4, None, "Oficina de música",              "https://picsum.photos/seed/cv-oficina/800/600"),
        (5, None, "Sala de aula comunitária",       "https://picsum.photos/seed/epf-sala/800/600"),
        (1, 1, "Distribuição de cestas básicas",    "https://picsum.photos/seed/campanha-cesta/800/600"),
        (2, 4, "Plantio de mudas nativas",          "https://picsum.photos/seed/campanha-mudas/800/600"),
        (3, 6, "Doação de agasalhos",               "https://picsum.photos/seed/campanha-agasalho/800/600"),
        (5, 10, "Crianças com material escolar novo","https://picsum.photos/seed/campanha-material/800/600"),
    ]
    cursor.executemany(
        "INSERT INTO imagem (id_ong, id_campanha, descricao, url) VALUES (%s, %s, %s, %s)",
        imagens,
    )


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 65)
    print("🌱  POPULANDO BANCO DE DADOS bd_encontreong")
    print("=" * 65)
    print(f"🔑  Senha padrão de TODOS os usuários: {SENHA_PADRAO}")
    print()

    conexao = get_db()
    cursor = conexao.cursor()

    try:
        # 1) Corrige o schema PRIMEIRO (fix do erro 1366)
        corrigir_schema(cursor)
        conexao.commit()

        # 2) Popula
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
        print("📊  Resumo:")
        print("    10 usuários   (5 voluntários + 5 representantes)")
        print("     5 ONGs       (cada uma com 1 representante diferente)")
        print("    12 campanhas  (5 de voluntariado + 7 de arrecadação)")
        print("    17 inscrições de voluntários em campanhas")
        print("    11 imagens    (7 de ONGs + 4 de campanhas)")
        print()
        print(f"🔑  Credenciais de teste (senha: {SENHA_PADRAO}):")
        print()
        print("    👤 VOLUNTÁRIOS")
        print("       joao@email.com      — João Silva")
        print("       maria@email.com     — Maria Santos")
        print("       fernanda@email.com  — Fernanda Rocha")
        print("       lucas@email.com     — Lucas Almeida")
        print("       julia@email.com     — Julia Ferreira")
        print()
        print("    🏢 REPRESENTANTES DE ONG")
        print("       pedro@email.com     — Instituto Esperança")
        print("       ana@email.com       — Verde Vivo")
        print("       carlos@email.com    — Saúde para Todos")
        print("       gabriel@email.com   — Cultura Viva")
        print("       larissa@email.com   — Educação para o Futuro")
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