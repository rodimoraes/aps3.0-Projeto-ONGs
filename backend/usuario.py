# Rodrigo Moraes
# Aqui quero começar a rascunhar uma conexão básica com o banco de dados

'''
Conectando o Python com Mysql
'''
import mysql.connector
from dotenv import load_dotenv
import os
load_dotenv()

conexao = mysql.connector.connect(
    host=os.getenv('DB_HOST'), user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'), database=os.getenv('DB_NAME'))

print("Conectado:", conexao.is_connected())

busca = conexao.cursor()

print('Cadastro de usuário: ')



busca.execute('Select * from usuario;')

for linha in busca.fetchall():
    print(linha)

nome = input('Digite seu nome:') 
cpf = input('Digite seu cpf:')
endereco = input('Digite seu endereço:') 
estado_civil= input('Digite o estado civil:')
rg = input('Digite seu rg')
email = input('Digite seu email')
data_nascimento = input('Data de Nascimento:')
voluntario = input('Voluntario:')
celular = input('Celular:')
representante_ong = input('É representante de ONG (s/n):')


#print(f'{id_usuario} - {nome} - {cpf} - {endereco} - {estado_civil} - {rg} - {email} - {data_nascimento} - {voluntario} - {celular} - {representante_ong}')

sql = "INSERT INTO usuario (nome, cpf,endereco,estado_civil,rg,email,data_nascimento,voluntario,celular,representante_ong) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
busca.execute(sql, (nome,cpf,endereco,estado_civil,rg,email,data_nascimento,voluntario,celular,representante_ong))
conexao.commit() # sem isso, a inserção não é persistida (Aula 1)
print("Novo id:", busca.lastrowid)


conexao.close()
'''
cursor = conexao.cursor()
cursor.execute("SELECT id_conta, titular, saldo FROM conta")

for linha in cursor.fetchall():
    print(linha)
    
#cursor.close()
#conexao.close()


cursor.execute("SELECT * FROM assento")

primeira = cursor.fetchone()        # traz só 1 linha (ou None)
algumas = cursor.fetchmany(size=3)  # traz até 3 linhas
resto = cursor.fetchall()           # traz todas as linhas restantes

print(primeira)
print(algumas)

# Jeito errado! Possibilita um sql injection 1 or 1=1
id_busca = input("ID da conta: ")
sql = (f"SELECT * FROM conta "
    f"WHERE id_conta = {id_busca}")
cursor.execute(sql)
print(cursor.fetchall())


# Jeito Certo! Impossibilita um sql injection 1 or 1=1
id_busca = input("ID da conta: ")
sql = ("SELECT * FROM conta "
        "WHERE id_conta = %s")
cursor.execute(sql, (id_busca,))
print(cursor.fetchall())

cursor = conexao.cursor()
sql = "INSERT INTO produto (nome, estoque) VALUES (%s, %s)"
cursor.execute(sql, ("Mousepad XL", 25))
conexao.commit() # sem isso, a inserção não é persistida (Aula 1)
print("Novo id:", cursor.lastrowid)
sql = "select * from produto"
cursor.execute(sql)
produtos = cursor.fetchall()
for linha in produtos:
    print(linha)

# UPDATE — sempre confira cursor.rowcount
sql = "UPDATE produto SET estoque = estoque - %s WHERE id_produto = %s AND estoque >=%s"
cursor.execute(sql, (1, 2, 1))
print(cursor.rowcount, "linha(s) afetada(s)")
conexao.commit()

# DELETE — mesma lógica, outro verbo SQL
cursor.execute("DELETE FROM produto WHERE id_produto >= %s", (6,))
conexao.commit()


cursor = conexao.cursor()
sql = "INSERT INTO produto (nome, estoque) VALUES (%s, %s)"
dados = [
    ("Headset Gamer", 12),
    ("Webcam Full HD", 8),
    ("Cabo HDMI 2m", 30),
]
cursor.executemany(sql, dados)
conexao.commit()
print(cursor.rowcount, "produtos inseridos")


conexao.start_transaction()
cursor = conexao.cursor()
try:
    cursor.execute("UPDATE conta SET saldo = saldo - 300 WHERE id_conta = 1")
    cursor.execute("UPDATE conta SET saldo = saldo + 300 WHERE id_conta = 2")
    conexao.commit()
    print("Transferência concluída.")
except mysql.connector.Error as e:
    conexao.rollback()
    print("Erro na transferência, desfazendo tudo:", e)
finally:
    cursor.close()
'''